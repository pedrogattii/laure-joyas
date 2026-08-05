'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { WhatsAppIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';
import { registerSupabaseSale, updateSupabaseProductStock } from '@/lib/supabaseSync';
import { sanitizeEmail, sanitizePhone, sanitizeText } from '@/lib/sanitizer';
import MercadoPagoBrick from '@/components/checkout/MercadoPagoBrick';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalCash, totalList, clearCart } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentTotal = formData.paymentMethod === 'cash' ? totalCash : totalList;

  // Validación y navegación entre pasos
  const validatePersonalData = () => {
    const cleanFirstName = sanitizeText(formData.firstName);
    const cleanLastName = sanitizeText(formData.lastName);
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizePhone(formData.phone);

    if (!cleanFirstName || !cleanLastName) {
      showToast('Por favor ingresá tu nombre y apellido.', 'error');
      return false;
    }
    if (!cleanEmail) {
      showToast('Por favor ingresá un correo electrónico válido.', 'error');
      return false;
    }
    if (!cleanPhone || cleanPhone.length < 6) {
      showToast('Por favor ingresá un número de teléfono válido.', 'error');
      return false;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: cleanPhone,
      dni: sanitizeText(formData.dni),
    }));

    return true;
  };

  const handleGoToStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validatePersonalData()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToStep3 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMercadoPagoSubmit = async (mpFormData: Record<string, unknown>) => {
    if (!validatePersonalData()) {
      setStep(1);
      return;
    }

    try {
      const extractedFormData = (mpFormData.formData || mpFormData) as Record<string, unknown>;

      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            ...extractedFormData,
            payer: {
              ...(extractedFormData.payer as Record<string, unknown> || {}),
              email: formData.email,
              identification: {
                type: 'DNI',
                number: sanitizeText(formData.dni) || '12345678',
              },
            },
          },
          transaction_amount: currentTotal,
          description: `Compra Laure Joyas - ${cart.length} ítem(s)`,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Ocurrió un problema al procesar el pago.');
      }

      if (data.status === 'approved' || data.status === 'in_process') {
        const msg = data.is_simulated
          ? `¡Pago de prueba registrado con éxito! ID: ${data.id}`
          : `¡Pago APROBADO por Mercado Pago! ID Transacción: ${data.id}`;
        showToast(msg, 'success');
        await completeOrder('MERCADO_PAGO', String(data.id));
      } else {
        showToast(`El pago fue ${data.status} (${data.status_detail || 'Intenta con otra tarjeta'}).`, 'error');
        throw new Error(`Estado de pago: ${data.status}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago.';
      console.error('Error procesando pago:', err);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleFinishPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === 'mercadopago') {
      showToast('Por favor completa los datos de tu tarjeta en la pasarela a continuación.', 'info');
      return;
    }

    if (!validatePersonalData()) {
      setStep(1);
      return;
    }

    // eslint-disable-next-line react-hooks/purity
    const paymentId = `${formData.paymentMethod.toUpperCase()}-${Date.now()}`;
    const methodTag = formData.paymentMethod === 'cash' ? 'EFECTIVO' : 'FISERV';

    completeOrder(methodTag, paymentId);
  };

  const completeOrder = async (method: string, paymentId: string) => {
    const customerFullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // Register items in Supabase
    for (const item of cart) {
      const itemPrice = formData.paymentMethod === 'cash' ? item.product.priceCash : item.product.priceList;
      await registerSupabaseSale({
        productId: item.product.id,
        quantity: item.quantity,
        totalAmount: itemPrice * item.quantity,
        paymentMethod: method,
        channel: 'ONLINE',
        transactionId: paymentId,
      });

      // Update inventory stock
      const newStock = Math.max(0, item.product.stock - item.quantity);
      await updateSupabaseProductStock(item.product.id, newStock);
    }

    showToast(`¡Gracias ${customerFullName}! Tu pedido #${paymentId} ha sido procesado con éxito.`, 'success');
    clearCart();
    router.push('/');
  };

  const handleWhatsAppModification = async () => {
    const itemsList = cart
      .map((item) => `• ${item.quantity}x ${item.product.name} (SKU: ${item.product.code}) - $${(formData.paymentMethod === 'cash' ? item.product.priceCash : item.product.priceList).toLocaleString('es-AR')}`)
      .join('\n');

    const message = `Hola Laure Joyas! Quiero realizar la siguiente compra pero necesito hacer unas modificaciones (ej. talle de anillo):\n\n${itemsList}\n\nTotal: $${currentTotal.toLocaleString('es-AR')}\nForma de pago elegida: ${formData.paymentMethod === 'cash' ? 'Efectivo/Transferencia' : 'Tarjetas'}\n\nMis datos:\n- Nombre: ${formData.firstName} ${formData.lastName}\n- Teléfono: ${formData.phone}`;

    if (BUSINESS_CONFIG.whatsappEnabled) {
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodedMsg}`, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(message);
        showToast('✓ Datos de pedido copiados al portapapeles.', 'success');
      } catch {
        showToast('Pedido preparado. Presentalo en la caja del local.', 'info');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f5]">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8 text-xs text-gray-500 font-sans">
          Cargando checkout...
        </main>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f5]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="font-serif text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <button 
            onClick={() => router.push('/catalogo')}
            className="bg-[#c5a059] text-black font-bold uppercase px-6 py-3 rounded shadow"
          >
            Volver al Catálogo
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#33312e]">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="badge-gold text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            Proceso de Compra Seguro
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Checkout</h1>
          <p className="text-gray-300 text-xs sm:text-sm font-sans">Completá los datos paso a paso para finalizar tu pedido</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8 flex-grow">
        <div className="flex-1 space-y-6">

          {/* Stepper Indicator */}
          <div className="stitch-card p-4 font-sans">
            <div className="flex items-center justify-between relative">
              
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full transition-all cursor-pointer ${
                  step === 1
                    ? 'bg-[#1a1918] text-[#c5a059] shadow-sm'
                    : step > 1
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                  step === 1 ? 'bg-[#c5a059] text-black' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span>1. Mis Datos</span>
              </button>

              <div className="flex-1 h-[2px] mx-2 bg-[#e8e3da]"></div>

              {/* Step 2 Pill */}
              <button
                type="button"
                onClick={() => { if (validatePersonalData()) setStep(2); }}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full transition-all cursor-pointer ${
                  step === 2
                    ? 'bg-[#1a1918] text-[#c5a059] shadow-sm'
                    : step > 2
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                  step === 2 ? 'bg-[#c5a059] text-black' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span>2. Entrega</span>
              </button>

              <div className="flex-1 h-[2px] mx-2 bg-[#e8e3da]"></div>

              {/* Step 3 Pill */}
              <button
                type="button"
                onClick={() => { if (validatePersonalData()) setStep(3); }}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full transition-all cursor-pointer ${
                  step === 3
                    ? 'bg-[#1a1918] text-[#c5a059] shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                  step === 3 ? 'bg-[#c5a059] text-black' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </span>
                <span>3. Pago</span>
              </button>

            </div>
          </div>

          {/* Step 1 Screen: Datos Personales */}
          {step === 1 && (
            <form onSubmit={handleGoToStep2} className="stitch-card p-6 font-sans space-y-6">
              <div className="border-b border-[#e8e3da] pb-3">
                <h2 className="font-serif text-xl font-bold text-[#1a1918]">Paso 1: Datos Personales</h2>
                <p className="text-gray-500 text-xs mt-1">Ingresá tus datos de contacto para la facturación y seguimiento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre *</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="ej. Juan" className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Apellido *</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="ej. Pérez" className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ej. juan@gmail.com" className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teléfono (WhatsApp) *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="ej. 3511234567" className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">DNI / CUIT *</label>
                  <input required name="dni" value={formData.dni} onChange={handleInputChange} placeholder="ej. 12345678" className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#1a1918] hover:bg-black text-[#c5a059] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>Continuar a Entrega</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 2 Screen: Forma de Entrega */}
          {step === 2 && (
            <form onSubmit={handleGoToStep3} className="stitch-card p-6 font-sans space-y-6">
              <div className="border-b border-[#e8e3da] pb-3">
                <h2 className="font-serif text-xl font-bold text-[#1a1918]">Paso 2: Método de Entrega</h2>
                <p className="text-gray-500 text-xs mt-1">Elegí cómo querés recibir tus productos</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Opción de Entrega</label>
                <select
                  name="deliveryMethod"
                  value={formData.deliveryMethod}
                  onChange={handleInputChange}
                  className="w-full border border-[#e8e3da] rounded-full px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white cursor-pointer font-medium"
                >
                  <option value="pickup">Retiro por local (Súper Mami Salsipuedes - Isla 1) - GRATIS</option>
                  <option value="shipping">Envío a domicilio (Coordinar costo por WhatsApp)</option>
                </select>
              </div>

              {formData.deliveryMethod === 'pickup' && (
                <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#e8e3da] text-xs text-gray-700 space-y-1">
                  <p className="font-bold text-[#1a1918]">📍 Punto de Retiro:</p>
                  <p>Súper Mami N°4 Salsipuedes - Isla 1 (Frente a las cajas principal).</p>
                  <p className="text-gray-500">Horario de atención: Lunes a Domingo de 10:00 a 21:00 hs.</p>
                </div>
              )}

              {formData.deliveryMethod === 'shipping' && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">🚚 Coordinación de Envío:</p>
                  <p>Nos pondremos en contacto vía WhatsApp ({formData.phone || 'tu número'}) para acordar la empresa de correo y calcular la tarifa de envío exacta.</p>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full border border-[#e8e3da] transition-all cursor-pointer"
                >
                  ⬅ Volver a Mis Datos
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1918] hover:bg-black text-[#c5a059] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>Continuar al Pago</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 3 Screen: Forma de Pago */}
          {step === 3 && (
            <form onSubmit={handleFinishPurchase} className="stitch-card p-6 font-sans space-y-6">
              <div className="border-b border-[#e8e3da] pb-3">
                <h2 className="font-serif text-xl font-bold text-[#1a1918]">Paso 3: Forma de Pago</h2>
                <p className="text-gray-500 text-xs mt-1">Seleccioná tu medio de pago preferido para finalizar la orden</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Medio de Pago</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full border border-[#e8e3da] rounded-full px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-[#fdf9f0] font-bold text-gray-800 cursor-pointer"
                >
                  <option value="cash">Efectivo / Transferencia (20% OFF Aplicado)</option>
                  <option value="mercadopago">Mercado Pago (Pasarela de Pago Online)</option>
                  <option value="fiserv">Fiserv / POSNET Direct (Hasta 3 cuotas sin interés)</option>
                </select>
              </div>

              {formData.paymentMethod === 'mercadopago' && (
                <div className="pt-2 border-t border-[#e8e3da] space-y-3">
                  <p className="text-xs font-bold text-gray-700">
                    Ingresá los datos de tu tarjeta en la pasarela de Mercado Pago:
                  </p>
                  <MercadoPagoBrick
                    amount={currentTotal}
                    payerEmail={formData.email}
                    payerDni={formData.dni}
                    onSubmitPayment={handleMercadoPagoSubmit}
                  />
                </div>
              )}

              {formData.paymentMethod !== 'mercadopago' && (
                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    className="w-full btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider py-4 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Finalizar Compra (${currentTotal.toLocaleString('es-AR')})</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center border-t border-[#e8e3da]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full border border-[#e8e3da] transition-all cursor-pointer"
                >
                  ⬅ Volver a Entrega
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppModification}
                  className="bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Modificar por WhatsApp</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Resumen del Pedido (Sidebar) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="stitch-card p-6 sticky top-24 font-sans">
            <h3 className="font-serif text-lg font-bold text-[#1a1918] mb-4 pb-2 border-b border-[#e8e3da]">Resumen de Pedido</h3>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-[#fcfbf9] rounded-xl border border-[#e8e3da] relative shrink-0 overflow-hidden flex items-center justify-center">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-1" />
                    ) : (
                      <span className="text-[8px] text-gray-400">Sin foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1a1918] truncate">{item.product.name}</p>
                    <p className="text-[10px] text-gray-500">Cant: {item.quantity}</p>
                    <p className="text-xs font-numeric font-bold text-emerald-700">
                      ${(formData.paymentMethod === 'cash' ? item.product.priceCash : item.product.priceList).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8e3da] pt-4 space-y-2 mb-2">
              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-gray-700">Total a pagar:</span>
                <span className="font-numeric text-xl text-emerald-800 font-extrabold">
                  ${currentTotal.toLocaleString('es-AR')}
                </span>
              </div>
              {formData.paymentMethod === 'cash' && (
                <p className="text-[10px] text-emerald-600 font-bold text-right">¡Incluye 20% OFF en Efectivo!</p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

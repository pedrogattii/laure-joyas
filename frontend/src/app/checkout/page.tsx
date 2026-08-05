'use client';

import { useState } from 'react';
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
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentTotal = formData.paymentMethod === 'cash' ? totalCash : totalList;

  const handleMercadoPagoSubmit = async (mpFormData: any) => {
    const cleanFirstName = sanitizeText(formData.firstName);
    const cleanLastName = sanitizeText(formData.lastName);
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizePhone(formData.phone);

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPhone) {
      showToast('Por favor completa todos tus datos personales (Nombre, Apellido, Email, Teléfono) antes de pagar.', 'error');
      throw new Error('Datos de contacto incompletos');
    }

    try {
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            ...mpFormData,
            payer: {
              ...mpFormData.payer,
              email: cleanEmail,
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
        showToast(`¡Pago APROBADO por Mercado Pago! ID Transacción: ${data.id}`, 'success');
        await completeOrder('MERCADO_PAGO', String(data.id));
      } else {
        showToast(`El pago fue ${data.status} (${data.status_detail || 'Intenta con otra tarjeta'}).`, 'error');
        throw new Error(`Estado de pago: ${data.status}`);
      }
    } catch (err: any) {
      console.error('Error procesando pago:', err);
      showToast(err.message || 'Error al procesar el pago.', 'error');
      throw err;
    }
  };

  const handleFinishPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === 'mercadopago') {
      showToast('Por favor completa los datos de tu tarjeta en el formulario de Mercado Pago a continuación.', 'info');
      return;
    }

    const cleanFirstName = sanitizeText(formData.firstName);
    const cleanLastName = sanitizeText(formData.lastName);
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizePhone(formData.phone);

    if (!cleanFirstName || !cleanLastName) {
      showToast('Por favor ingresá tu nombre y apellido.', 'error');
      return;
    }

    if (!cleanEmail) {
      showToast('Por favor ingresá un correo electrónico válido.', 'error');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 6) {
      showToast('Por favor ingresá un número de teléfono de contacto válido.', 'error');
      return;
    }

    // Update sanitized form state
    setFormData({
      ...formData,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      phone: cleanPhone,
      dni: sanitizeText(formData.dni),
    });

    const paymentId = `${formData.paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
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
      
      <div className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#33312e]">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="badge-gold text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            Proceso de Compra Seguro
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Checkout</h1>
          <p className="text-gray-300 text-xs sm:text-sm font-sans">Completá tus datos para finalizar tu pedido en Laure Joyas</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8 flex-grow">
        {/* Formularios */}
        <div className="flex-1 space-y-6">
          <form id="checkout-form" onSubmit={handleFinishPurchase} className="space-y-6 font-sans">
            
            <section className="stitch-card p-6">
              <h2 className="font-serif text-xl font-bold text-[#1a1918] mb-4 border-b border-[#e8e3da] pb-3">1. Datos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre *</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Apellido *</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teléfono (WhatsApp) *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">DNI / CUIT *</label>
                  <input required name="dni" value={formData.dni} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                </div>
              </div>
            </section>

            <section className="stitch-card p-6">
              <h2 className="font-serif text-xl font-bold text-[#1a1918] mb-4 border-b border-[#e8e3da] pb-3">2. Entrega</h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Método de entrega</label>
                <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-white cursor-pointer">
                  <option value="pickup">Retiro por local (Súper Mami Salsipuedes - Isla 1) - GRATIS</option>
                  <option value="shipping">Envío a domicilio (Coordinar costo por WhatsApp)</option>
                </select>
              </div>
            </section>

            <section className="stitch-card p-6">
              <h2 className="font-serif text-xl font-bold text-[#1a1918] mb-4 border-b border-[#e8e3da] pb-3">3. Forma de Pago</h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Método de pago</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full border border-[#e8e3da] rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold bg-[#fdf9f0] font-bold text-gray-800 cursor-pointer">
                  <option value="cash">Efectivo / Transferencia (20% OFF Aplicado)</option>
                  <option value="mercadopago">Mercado Pago (Pasarela de Pago Online)</option>
                  <option value="fiserv">Fiserv / POSNET Direct (Hasta 3 cuotas sin interés)</option>
                </select>
              </div>

              {formData.paymentMethod === 'mercadopago' && (
                <div className="mt-6 pt-4 border-t border-[#e8e3da]">
                  <p className="text-xs font-bold text-gray-700 mb-3 font-sans">
                    Ingresá los datos de tu tarjeta en la pasarela segura de Mercado Pago:
                  </p>
                  <MercadoPagoBrick
                    amount={currentTotal}
                    payerEmail={formData.email}
                    payerDni={formData.dni}
                    onSubmitPayment={handleMercadoPagoSubmit}
                  />
                </div>
              )}
            </section>

          </form>
        </div>

        {/* Resumen del Pedido */}
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

            <div className="border-t border-[#e8e3da] pt-4 space-y-2 mb-6">
              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-gray-700">Total a pagar:</span>
                <span className="font-numeric text-xl text-emerald-800 font-extrabold">
                  ${currentTotal.toLocaleString('es-AR')}
                </span>
              </div>
              {formData.paymentMethod === 'cash' && (
                <p className="text-[10px] text-emerald-600 font-bold text-right">¡Incluye 20% OFF!</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                form="checkout-form"
                className="w-full btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider py-4 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {formData.paymentMethod === 'cash' ? 'Finalizar Compra' : 'Probar Pasarela de Pago'}
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[#e8e3da]"></div>
                <span className="flex-shrink-0 mx-2 text-gray-400 text-[10px] uppercase font-semibold">O modificaciones</span>
                <div className="flex-grow border-t border-[#e8e3da]"></div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppModification}
                className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Modificar por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}


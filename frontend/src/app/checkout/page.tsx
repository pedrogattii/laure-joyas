'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { WhatsAppIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalCash, totalList, clearCart } = useCart();
  
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

  const handleFinishPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`¡Gracias ${formData.firstName}! Tu pedido ha sido confirmado con éxito. Nos pondremos en contacto contigo pronto.`);
    clearCart();
    router.push('/');
  };

  const handleWhatsAppModification = () => {
    const itemsList = cart
      .map((item) => `• ${item.quantity}x ${item.product.name} (SKU: ${item.product.code}) - $${(formData.paymentMethod === 'cash' ? item.product.priceCash : item.product.priceList).toLocaleString('es-AR')}`)
      .join('%0A');

    const message = `Hola Laure Joyas! Quiero realizar la siguiente compra pero necesito hacer unas modificaciones (ej. talle de anillo):%0A%0A${itemsList}%0A%0ATotal: $${currentTotal.toLocaleString('es-AR')}%0AForma de pago elegida: ${formData.paymentMethod === 'cash' ? 'Efectivo/Transferencia' : 'Tarjetas (Precio Lista)'}%0A%0AMis datos:%0A- Nombre: ${formData.firstName} ${formData.lastName}%0A- Teléfono: ${formData.phone}`;

    window.open(`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${message}`, '_blank');
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
      
      <div className="bg-[#121212] text-white py-8 px-4 border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Checkout</h1>
          <p className="text-gray-400 text-sm mt-1">Completá tus datos para finalizar la compra</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Formularios */}
        <div className="flex-1 space-y-6">
          <form id="checkout-form" onSubmit={handleFinishPurchase} className="space-y-6">
            
            <section className="bg-white p-6 rounded shadow border border-gray-200">
              <h2 className="font-serif text-xl font-bold mb-4 border-b pb-2">1. Datos Personales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Apellido *</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono (WhatsApp) *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">DNI / CUIT *</label>
                  <input required name="dni" value={formData.dni} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]" />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded shadow border border-gray-200">
              <h2 className="font-serif text-xl font-bold mb-4 border-b pb-2">2. Entrega</h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Método de entrega</label>
                <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]">
                  <option value="pickup">Retiro por local (Súper Mami Salsipuedes) - GRATIS</option>
                  <option value="shipping">Envío a domicilio (Coordinar costo)</option>
                </select>
              </div>
            </section>

            <section className="bg-white p-6 rounded shadow border border-gray-200">
              <h2 className="font-serif text-xl font-bold mb-4 border-b pb-2">3. Pago</h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Método de pago</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]">
                  <option value="cash">Efectivo / Transferencia (20% OFF)</option>
                  <option value="card">Tarjetas / Hasta 3 cuotas sin interés (Precio Lista)</option>
                </select>
              </div>
            </section>

          </form>
        </div>

        {/* Resumen del Pedido */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-6 rounded shadow border border-[#e5dfd5] sticky top-6">
            <h3 className="font-serif text-lg font-bold mb-4 pb-2 border-b">Resumen de Pedido</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center relative shrink-0">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-1" />
                    ) : (
                      <span className="text-[8px] text-gray-400">No img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.product.name}</p>
                    <p className="text-[10px] text-gray-500">Cant: {item.quantity}</p>
                    <p className="text-xs font-mono font-bold">
                      ${(formData.paymentMethod === 'cash' ? item.product.priceCash : item.product.priceList).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm font-bold">
                <span>Total a pagar:</span>
                <span className="font-mono text-lg text-[#c5a059]">
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
                className="w-full bg-[#121212] hover:bg-black text-[#c5a059] border border-[#c5a059] font-bold text-xs uppercase py-3.5 rounded shadow btn-animate cursor-pointer"
              >
                Finalizar Compra
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O si necesitas talles/modificaciones</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppModification}
                className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase py-3.5 rounded shadow-md flex items-center justify-center gap-2 btn-whatsapp cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Modificar pedido por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPinIcon, CartIcon, WhatsAppIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';

export default function LocationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#33312e] text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="badge-gold text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            Local Físico &amp; Puntos de Retiro
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
            Dónde Encontrarnos
          </h1>
          <p className="text-gray-300 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed font-sans">
            Te esperamos en nuestra isla del Super Mami N°4 en Salsipuedes para retirar tus compras online sin costo o ver todas nuestras joyas en persona.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-10">
        {/* Main Location Card */}
        <div className="stitch-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Details */}
          <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#1a1918] text-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold/30">
                  Sucursal Principal
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  Abierto Hoy
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#1a1918] mb-2">
                Isla Laure Joyas (Super Mami N°4)
              </h2>

              <p className="text-xs text-gray-600 leading-relaxed mb-6 font-sans">
                Nos encontrás justo en la <strong>primer isla al ingresar</strong> al predio comercial del Super Mami N°4 en Salsipuedes, Córdoba.
              </p>

              <div className="space-y-4 border-t border-[#e8e3da] pt-4 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">Dirección:</span>
                    <span className="text-gray-600">{BUSINESS_CONFIG.storeAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">Ubicación exacta en el paseo:</span>
                    <span className="text-gray-600">{BUSINESS_CONFIG.storeLocationDetail}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CartIcon className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">Retiro de compras web:</span>
                    <span className="text-emerald-700 font-semibold">Gratis e Inmediato coordinando la compra</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Button */}
            <div className="pt-4 border-t border-[#e8e3da]">
              <a
                href={BUSINESS_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MapPinIcon className="w-4 h-4 text-white" />
                <span>Abrir Ubicación en Google Maps</span>
              </a>
            </div>
          </div>

          {/* Location Map Placeholder Card */}
          <div className="bg-[#1a1918] text-white p-8 sm:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2 font-sans">
                Información de Retiro
              </span>
              <h3 className="font-serif text-xl font-bold mb-4 text-white">
                ¿Cómo funciona el Retiro por la Isla?
              </h3>

              <ol className="space-y-4 text-xs text-gray-300 list-decimal list-inside leading-relaxed font-sans">
                <li className="pl-1">
                  <strong>Elegís tus joyas:</strong> Seleccionás los productos en la web y elegís la opción de pago contado o transferencia.
                </li>
                <li className="pl-1">
                  <strong>Coordinás el retiro:</strong> Te avisamos apenas tu pedido esté listo para retirar en la isla.
                </li>
                <li className="pl-1">
                  <strong>Retirás al instante:</strong> Presentás tu nombre en la primera isla del Super Mami N°4 y te entregamos tu paquete envuelto para regalo.
                </li>
              </ol>
            </div>

            <div className="mt-8 bg-[#23211f] p-4 rounded-xl border border-white/10 text-xs font-sans">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hola%20Laure%20Joyas!%20Tengo%20una%20consulta%20para%20pasar%20por%20la%20isla`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-[#e0bb70] font-bold flex items-center gap-2 mb-1 cursor-pointer transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>Consultar llegada por WhatsApp →</span>
              </a>
              <p className="text-gray-300">
                Podés escribirnos directamente antes de pasar para confirmar disponibilidad inmediata de tu producto.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


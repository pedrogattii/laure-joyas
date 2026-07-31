'use client';

import Header from '@/components/Header';
import { MapPinIcon, CartIcon, WhatsAppIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';

export default function LocationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Header Banner */}
      <div className="bg-[#121212] text-white py-12 px-4 border-b border-[#2a2a2a] text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-widest block mb-2">
            Local Físico & Puntos de Retiro
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Dónde Encontrarnos
          </h1>
          <p className="text-gray-300 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Te esperamos en nuestra isla del Super Mami N°4 en Salsipuedes para retirar tus compras online sin costo o ver todas nuestras joyas en persona.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-10">
        {/* Main Location Card */}
        <div className="bg-white rounded-xl border border-[#e5e0d8] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Details */}
          <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#121212] text-[#c5a059] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Sucursal Principal
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  Abierto Hoy
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                Isla Laure Joyas (Super Mami N°4)
              </h2>

              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Nos encontrás justo en la <strong>primer isla al ingresar</strong> al predio comercial del Super Mami N°4 en Salsipuedes, Córdoba.
              </p>

              <div className="space-y-4 border-t border-gray-100 pt-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">Dirección:</span>
                    <span className="text-gray-600">{BUSINESS_CONFIG.storeAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
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
            <div className="pt-4 border-t border-gray-100">
              <a
                href={BUSINESS_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded shadow flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer hover:shadow-md"
              >
                <MapPinIcon className="w-4 h-4 text-black" />
                <span>Abrir Ubicación en Google Maps</span>
              </a>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                *(Enlace directo al predio Super Mami Salsipuedes)*
              </p>
            </div>
          </div>

          {/* Location Map Placeholder Card */}
          <div className="bg-[#1e1e1e] text-white p-8 sm:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-800">
            <div>
              <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest block mb-2">
                Información de Retiro
              </span>
              <h3 className="font-serif text-xl font-bold mb-4">
                ¿Cómo funciona el Retiro por la Isla?
              </h3>

              <ol className="space-y-4 text-xs text-gray-300 list-decimal list-inside leading-relaxed">
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

            <div className="mt-8 bg-[#2a2a2a] p-4 rounded-lg border border-[#333] text-xs">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hola%20Laure%20Joyas!%20Tengo%20una%20consulta%20para%20pasar%20por%20la%20isla`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c5a059] hover:text-[#e0bb70] font-bold flex items-center gap-1.5 mb-1 cursor-pointer transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                ¿Tenés alguna duda para llegar? Escribinos por WhatsApp ➔
              </a>
              <p className="text-gray-300">
                Podés escribirnos directamente antes de pasar para confirmar disponibilidad inmediata de tu producto.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#121212] text-gray-400 py-8 border-t border-[#2a2a2a] text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-serif text-white font-bold text-sm mb-1">LAURE JOYAS</p>
          <p className="mb-4">Super Mami N°4 Salsipuedes (Primera Isla) • Córdoba, Argentina</p>
          <p className="text-gray-500">© 2026 Laure Joyas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

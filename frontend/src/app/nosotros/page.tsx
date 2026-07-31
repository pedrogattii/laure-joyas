'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Header Banner */}
      <div className="bg-[#121212] text-white py-12 px-4 border-b border-[#2a2a2a] text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-widest block mb-2">
            Nuestra Historia & Tradición
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Más de 12 Años en Salsipuedes
          </h1>
          <p className="text-gray-300 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Una trayectoria de confianza, dedicación artesanal y pasión por los detalles que hacen único cada momento.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-12">
        {/* Story Section */}
        <section className="bg-white p-8 sm:p-12 rounded-xl border border-[#e5e0d8] shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#fcf8f0] border border-[#c5a059] flex items-center justify-center text-[#c5a059] font-serif font-bold text-sm">
              LJ
            </div>
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest">
              Nuestra Esencia
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            Tradición familiar y orfebrería de calidad en Sierras Chicas
          </h2>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Laure Joyas nació en Salsipuedes hace más de una década como un proyecto dedicado a ofrecer la mejor calidad en artículos de Plata 925, Plata con Oro Double y piezas seleccionadas en Oro 18kts macizo.
            </p>
            <p>
              Con el paso de los años y la confianza acumulada de nuestros vecinos y clientes de toda la zona de Sierras Chicas, nos consolidamos como la joyería referente con presencia física en la isla principal del <strong>Super Mami N°4 en Salsipuedes</strong>.
            </p>
          </div>

          {/* Placeholder Notice for Owner */}
          <div className="bg-[#fcf9f2] p-4 rounded-lg border border-dashed border-[#d8ccb8] text-xs text-gray-600 mt-6">
            <span className="font-bold text-[#a8843e] block mb-1">Espacio preparado para fotos de la historia:</span>
            Acá vas a poder agregar tus imágenes del taller, fotos del equipo e hitos de la joyería con el texto que prefieras.
          </div>
        </section>

        {/* Pillars / Services */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#e5e0d8] shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-[#c5a059] text-[#c5a059] flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              01
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">Taller Propio</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Realizamos alianzas a medida, arreglos de joyas en plata y oro, grabados personalizados y puesta a punto de relojería.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e0d8] shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-[#c5a059] text-[#c5a059] flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              02
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">Calidad Garantizada</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Trabajamos únicamente metales nobles probados: Plata 925 auténtica, Acero 316L inalterable y Oro 18kts certificado.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#e5e0d8] shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-[#c5a059] text-[#c5a059] flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              03
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">Atención Cercana</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Atendidos por sus propios dueños y equipo con años de experiencia asesorándote para encontrar la joya ideal.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-[#121212] text-white p-8 rounded-xl text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold">¿Querés visitarnos o retirar tu pedido?</h3>
          <p className="text-xs text-gray-300 max-w-xl mx-auto">
            Te esperamos en la primera isla ingresando al Super Mami N°4 en Salsipuedes.
          </p>
          <div>
            <Link
              href="/donde-encontrarnos"
              className="inline-block bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded shadow"
            >
              Ver Ubicación & Horarios
            </Link>
          </div>
        </section>
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

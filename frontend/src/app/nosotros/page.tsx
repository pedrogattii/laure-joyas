'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#33312e] text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="badge-gold text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            Nuestra Historia &amp; Tradición
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
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
        <section className="stitch-card p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#fcf8f0] border border-gold flex items-center justify-center text-gold font-serif font-bold text-sm">
              LJ
            </div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest">
              Nuestra Esencia
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a1918] leading-snug">
            Tradición familiar y orfebrería de calidad en Sierras Chicas
          </h2>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed font-sans">
            <p>
              Laure Joyas nació en Salsipuedes hace más de una década como un proyecto dedicado a ofrecer la mejor calidad en artículos de Plata 925, Plata con Oro Double y piezas seleccionadas en Oro 18kts macizo.
            </p>
            <p>
              Con el paso de los años y la confianza acumulada de nuestros vecinos y clientes de toda la zona de Sierras Chicas, nos consolidamos como la joyería referente con presencia física en la isla principal del <strong>Super Mami N°4 en Salsipuedes</strong>.
            </p>
          </div>
        </section>

        {/* Pillars / Services */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stitch-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-gold text-gold flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              01
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1a1918] mb-2">Taller Propio</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Realizamos alianzas a medida, arreglos de joyas en plata y oro, grabados personalizados y puesta a punto de relojería.
            </p>
          </div>

          <div className="stitch-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-gold text-gold flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              02
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1a1918] mb-2">Calidad Garantizada</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Trabajamos únicamente metales nobles probados: Plata 925 auténtica, Acero 316L inalterable y Oro 18kts certificado.
            </p>
          </div>

          <div className="stitch-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fcf8f0] border border-gold text-gold flex items-center justify-center mx-auto mb-3 font-serif font-bold text-lg">
              03
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1a1918] mb-2">Atención Cercana</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Atendidos por sus propios dueños y equipo con años de experiencia asesorándote para encontrar la joya ideal.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-gradient-to-r from-[#1a1918] to-[#252321] text-white p-8 rounded-3xl text-center space-y-4 border border-gold/30 shadow-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">¿Querés visitarnos o retirar tu pedido?</h3>
          <p className="text-xs text-gray-300 max-w-xl mx-auto font-sans">
            Te esperamos en la primera isla ingresando al Super Mami N°4 en Salsipuedes.
          </p>
          <div className="pt-2">
            <Link
              href="/donde-encontrarnos"
              className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full inline-block shadow-md"
            >
              Ver Ubicación &amp; Horarios
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


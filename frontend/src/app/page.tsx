'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { MapPinIcon } from '@/components/icons/SvgIcons';
import { useSupabaseProducts } from '@/lib/supabaseSync';

export default function HomePage() {
  const { products } = useSupabaseProducts();

  const featuredProducts = products.filter((p) => p.isFeatured || true);
  const offerProducts = products.filter((p) => p.isOffer || true);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#1a1918] to-[#242220] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#33312e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="badge-gold text-xs tracking-widest uppercase mb-4 inline-block px-4 py-1.5 rounded-full">
            Joyería &amp; Orfebrería • Salsipuedes, Córdoba
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight mb-5 text-white leading-tight">
            Elegancia en Plata 925 &amp; Oro 18kts
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-10 font-sans font-light leading-relaxed">
            Descubrí nuestras piezas exclusivas. Nos encontrás en <strong className="text-gold font-semibold">Super Mami N°4 Salsipuedes (Isla 1)</strong>. Aprovechá nuestros descuentos especiales en pago contado por transferencia o efectivo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-lg"
            >
              Ver Catálogo Completo
            </Link>
            <Link
              href="/donde-encontrarnos"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest px-7 py-4 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2.5 shadow-sm"
            >
              <MapPinIcon className="w-4 h-4 text-gold" />
              <span>Cómo Llegar &amp; Retiros</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Home Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full space-y-20">
        {/* Section 1: Special Offers */}
        {offerProducts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-10 border-b border-[#e8e3da] pb-5">
              <div>
                <span className="text-xs font-extrabold text-rose-500 uppercase tracking-widest block mb-1 font-sans">
                  Oportunidades del Mes
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1918]">
                  Ofertas Especiales
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-xs font-bold text-gold hover:text-[#9e7d37] uppercase tracking-wider transition-colors font-sans"
              >
                Ver Todas &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {offerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-10 border-b border-[#e8e3da] pb-5">
            <div>
              <span className="text-xs font-extrabold text-gold uppercase tracking-widest block mb-1 font-sans">
                Selección Exclusiva
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1918]">
                Productos Destacados
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-xs font-bold text-gold hover:text-[#9e7d37] uppercase tracking-wider transition-colors font-sans"
            >
              Ir al Catálogo &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>

        {/* Informative Banner */}
        <section className="bg-gradient-to-r from-[#1a1918] to-[#2b2825] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#c5a059]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl relative z-10">
            <span className="badge-gold text-xs font-bold uppercase tracking-widest block mb-3 px-3 py-1 rounded-full w-fit">
              Atención Personalizada en Salsipuedes
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold mb-3 text-white leading-tight">
              ¿Buscás un regalo especial o alianzas a medida?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-sans font-light leading-relaxed">
              En nuestra isla del Super Mami N°4 podés retirar tus compras online sin costo o encargar trabajos a medida en nuestro taller de orfebrería.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10 shrink-0">
            <Link
              href="/donde-encontrarnos"
              className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-full text-center shadow-lg"
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


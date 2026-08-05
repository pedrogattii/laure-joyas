'use client';

import Image from 'next/image';
import Link from 'next/link';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { MapPinIcon, SparklesIcon } from '@/components/icons/SvgIcons';
import { useSupabaseProducts, useSupabaseBanners } from '@/lib/supabaseSync';

export default function HomePage() {
  const { products } = useSupabaseProducts();
  const { banners } = useSupabaseBanners();

  const featuredProducts = products.filter((p) => p.isFeatured || true);
  const offerProducts = products.filter((p) => p.isOffer || true);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Hero Split Section (Stitch Style) */}
      <section className="bg-gradient-to-b from-[#1a1918] via-[#23211f] to-[#1a1918] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#33312e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 badge-gold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
              <SparklesIcon className="w-4 h-4 text-gold animate-spin-slow" />
              <span>Joyería &amp; Orfebrería • Salsipuedes, Córdoba</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Elegancia Atemporal en <span className="shimmer-badge">Plata 925</span> &amp; Oro 18kts
            </h1>

            <p className="text-gray-300 text-sm sm:text-base max-w-xl font-sans font-light leading-relaxed">
              Diseños únicos elaborados con precisión artesanal. Visitá nuestro local en <strong className="text-gold font-semibold">Super Mami N°4 Salsipuedes (Isla 1)</strong> o comprá online con <strong className="text-emerald-400 font-numeric font-bold">20% OFF</strong> en efectivo/transferencia.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/catalogo"
                className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-lg"
              >
                Explorar Catálogo
              </Link>
              <Link
                href="/donde-encontrarnos"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest px-7 py-4 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2.5 shadow-sm"
              >
                <MapPinIcon className="w-4 h-4 text-gold" />
                <span>Ubicación &amp; Retiros</span>
              </Link>
            </div>
          </div>

          {/* Hero Right Visual Dynamic Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#c5a059]/40 group">
              <Image
                src={banners.hero_banner || '/images/hero_jewelry.png'}
                alt="Laure Joyas Alta Joyería"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />


              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 glass-dark p-4 rounded-2xl animate-float">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                      Taller de Orfebrería
                    </span>
                    <span className="font-serif text-sm font-bold text-white">
                      Piezas a Medida &amp; Garantía de por vida
                    </span>
                  </div>
                  <span className="bg-gold-gradient text-white text-[10px] font-extrabold px-3 py-1 rounded-full font-numeric">
                    Plata 925
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Home Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full space-y-20">
        
        {/* Category Highlight Cards (Stitch Style Layout) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stitch-card p-6 bg-gradient-to-br from-[#fcfbf9] to-[#f5f2eb] border border-[#e8e3da] flex flex-col justify-between group cursor-pointer hover:shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-[#f5ecda] px-3 py-1 rounded-full inline-block mb-3">
                Plata 925
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1a1918] mb-2 group-hover:text-gold transition-colors">
                Cadenas &amp; Dijes
              </h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Diseños finos y elegantes fabricados con Plata 925 de máxima pureza.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a1918] uppercase tracking-wider group-hover:underline">
                Ver Colección
              </span>
              <span className="text-gold font-bold">&rarr;</span>
            </div>
          </div>

          <div className="stitch-card p-6 bg-gradient-to-br from-[#fcfbf9] to-[#f5f2eb] border border-[#e8e3da] flex flex-col justify-between group cursor-pointer hover:shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-[#f5ecda] px-3 py-1 rounded-full inline-block mb-3">
                Oro 18kts
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1a1918] mb-2 group-hover:text-gold transition-colors">
                Anillos &amp; Alianzas
              </h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Compromiso y bodas con grabado personalizado sin cargo.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a1918] uppercase tracking-wider group-hover:underline">
                Ver Alianzas
              </span>
              <span className="text-gold font-bold">&rarr;</span>
            </div>
          </div>

          <div className="stitch-card p-6 bg-gradient-to-br from-[#fcfbf9] to-[#f5f2eb] border border-[#e8e3da] flex flex-col justify-between group cursor-pointer hover:shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full inline-block mb-3">
                Beneficio Exclusivo
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1a1918] mb-2 group-hover:text-emerald-700 transition-colors">
                20% OFF Contado
              </h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Descuento directo en todos tus pedidos pagando por transferencia o efectivo.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a1918] uppercase tracking-wider group-hover:underline">
                Saber Más
              </span>
              <span className="text-emerald-700 font-bold">&rarr;</span>
            </div>
          </div>
        </section>

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

        {/* Dynamic Image Feature Banner */}
        <section className="bg-gradient-to-r from-[#1a1918] via-[#2b2825] to-[#1a1918] text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 border border-[#c5a059]/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-xl relative z-10 space-y-4">
            <span className="badge-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
              Atención Personalizada en Salsipuedes
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              ¿Buscás alianzas de bodas o un regalo especial?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-sans font-light leading-relaxed">
              En nuestra isla del Super Mami N°4 podés retirar tus compras online sin costo o encargar trabajos a medida directamente en nuestro taller de orfebrería.
            </p>
            <div className="pt-2">
              <Link
                href="/donde-encontrarnos"
                className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full inline-block shadow-lg"
              >
                Ver Ubicación &amp; Horarios
              </Link>
            </div>
          </div>

          {/* Dynamic Image Tile */}
          <div className="relative w-full lg:w-96 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl border border-white/20 shrink-0 group">
            <Image
              src={banners.alliance_banner || '/images/alliances_jewelry.png'}
              alt="Alianzas en Oro y Plata Laure Joyas"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <span className="absolute bottom-4 left-4 text-xs font-serif font-bold text-white tracking-wider">
              Trabajos a Medida &amp; Grabados
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}



'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import type { ProductItem } from '@/lib/types';
import { MapPinIcon } from '@/components/icons/SvgIcons';
import { useSupabaseProducts } from '@/lib/supabaseSync';

export default function HomePage() {
  const { products, loading } = useSupabaseProducts();

  const featuredProducts = products.filter((p) => p.isFeatured || true);
  const offerProducts = products.filter((p) => p.isOffer || true);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#2a2a2a] relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="text-[#c5a059] text-xs font-semibold tracking-widest uppercase mb-3 block">
            Joyería &amp; Orfebrería • Salsipuedes, Córdoba
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
            Elegancia en Plata 925 &amp; Oro 18kts
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Descubrí nuestras piezas exclusivas. Nos encontrás en <strong>Super Mami N°4 Salsipuedes (Isla 1)</strong>. Aprovechá nuestros descuentos especiales en pago contado por transferencia o efectivo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo"
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded shadow-lg transition-transform hover:scale-105"
            >
              Ver Catálogo Completo
            </Link>
            <Link
              href="/donde-encontrarnos"
              className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-200 font-semibold text-xs uppercase tracking-widest px-6 py-3.5 rounded border border-[#444] transition-colors flex items-center gap-2"
            >
              <MapPinIcon className="w-4 h-4 text-[#c5a059]" />
              <span>Cómo Llegar &amp; Retiros</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Home Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-16">
        {/* Section 1: Special Offers */}
        {offerProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest block mb-1">
                  Oportunidades del Mes
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                  Ofertas Especiales
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-xs font-bold text-[#c5a059] hover:underline uppercase tracking-wider"
              >
                Ver Todas
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest block mb-1">
                Selección Exclusiva
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Productos Destacados
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-xs font-bold text-[#c5a059] hover:underline uppercase tracking-wider"
            >
              Ir al Catálogo
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>

        {/* Informative Banner */}
        <section className="bg-[#121212] text-white rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#2a2a2a]">
          <div className="max-w-xl">
            <span className="text-xs text-[#c5a059] font-bold uppercase tracking-widest block mb-2">
              Atención Personalizada en Salsipuedes
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              ¿Buscás un regalo especial o alianzas a medida?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
              En nuestra isla del Super Mami N°4 podés retirar tus compras online sin costo o encargar trabajos a medida en nuestro taller.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              href="/donde-encontrarnos"
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded text-center shadow"
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

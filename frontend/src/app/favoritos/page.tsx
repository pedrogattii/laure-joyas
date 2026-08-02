'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import { HeartIcon } from '@/components/icons/SvgIcons';
import Link from 'next/link';

export default function FavoritosPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <div className="bg-[#121212] text-white py-10 px-4 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-widest block mb-1">
            Tu selección personal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Mis Favoritos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {wishlist.length > 0
              ? `${wishlist.length} joya${wishlist.length > 1 ? 's' : ''} guardada${wishlist.length > 1 ? 's' : ''}`
              : 'Todavía no agregaste favoritos'}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg border border-[#e5e0d8] text-center max-w-md mx-auto my-12">
            <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">Sin favoritos aún</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tocá el ícono de corazón ❤️ en cualquier joya para guardarla aquí y encontrarla fácil después.
            </p>
            <Link
              href="/catalogo"
              className="bg-[#c5a059] text-black font-bold text-xs uppercase px-6 py-3 rounded shadow inline-block"
            >
              Explorar Catálogo
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

import Image from 'next/image';
import type { ProductItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { CartIcon, CreditCardIcon, HeartIcon, HeartFilledIcon } from '@/components/icons/SvgIcons';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const savings = product.priceList - product.priceCash;
  const installmentAmount = Math.round(product.priceList / 3);
  const isFav = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      showToast('Este producto no tiene stock disponible', 'warning');
      return;
    }
    addToCart(product);
    showToast(`${product.name} agregado al carrito`, 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(
      isFav ? 'Eliminado de favoritos' : '❤️ Guardado en favoritos',
      isFav ? 'info' : 'success'
    );
  };

  return (
    <Link
      href={`/catalogo/${product.id}`}
      className={`stitch-card overflow-hidden cursor-pointer flex flex-col justify-between group block relative ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full h-64 bg-[#fcfbf9] flex items-center justify-center p-4 border-b border-[#e8e3da]/60">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out ${isOutOfStock ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="text-center p-6 bg-[#f7f4ee] rounded-xl border border-dashed border-[#e8e3da] w-full h-full flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 font-medium tracking-wider">Foto próximamente</span>
              <span className="text-[10px] text-gold mt-1 uppercase font-semibold">Laure Joyas</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-[#1a1918] text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-gray-700">
                Sin Stock
              </span>
            </div>
          )}

          {/* Top Left SKU Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
            <span className="bg-[#1a1918]/90 backdrop-blur-sm text-gold text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full shadow-sm border border-gold/30">
              {product.code}
            </span>
          </div>

          {/* Top Right: 20% OFF + Wishlist Heart */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-20">
            {!isOutOfStock && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
                20% OFF Contado
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all active:scale-90 ${
                isFav
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-gray-400 hover:text-rose-500 border border-[#e8e3da]'
              }`}
              title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFav ? (
                <HeartFilledIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Info Container */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-[#f5ecda] px-2.5 py-0.5 rounded-full border border-gold/20">
              {product.category.name}
            </span>
            <span className="text-[10px] text-gray-600 font-medium bg-[#f5f2eb] px-2.5 py-0.5 rounded-full border border-[#e8e3da]">
              {product.material.name}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-[#1a1918] line-clamp-2 mb-2 leading-snug group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Installments Section */}
      <div className="p-5 pt-0 border-t border-[#e8e3da]/40 mt-auto">
        {/* Cash / Transfer Highlighted Price */}
        <div className="bg-[#fcfbf9] p-3 rounded-xl border border-emerald-300/80 mb-3 shadow-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">
              Precio Contado:
            </span>
            <span className="text-xl font-bold text-emerald-700 font-numeric">
              ${product.priceCash.toLocaleString('es-AR')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Efectivo o Transferencia</p>

          {savings > 0 && (
            <div className="mt-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
              Ahorrás ${savings.toLocaleString('es-AR')} abonando contado
            </div>
          )}
        </div>

        {/* Credit Card Installments */}
        <div className="bg-[#fcfbf9] p-2.5 rounded-xl border border-[#e8e3da] text-xs mb-4">
          <div className="flex items-center justify-between text-gray-700">
            <span className="font-semibold flex items-center gap-1 text-[11px]">
              <CreditCardIcon className="w-3.5 h-3.5 text-gray-500" />
              3 Cuotas Sin Interés:
            </span>
            <span className="font-bold text-[#1a1918] font-numeric">
              3x ${installmentAmount.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Todos los bancos (${product.priceList.toLocaleString('es-AR')} total)
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : 'btn-stitch-gold text-white cursor-pointer shadow-sm hover:shadow-md'
            }`}
          >
            <CartIcon className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}


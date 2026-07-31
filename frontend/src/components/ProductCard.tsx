'use client';

import Image from 'next/image';
import { ProductItem } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import { CartIcon, CreditCardIcon } from '@/components/icons/SvgIcons';

interface ProductCardProps {
  product: ProductItem;
  onSelect?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addToCart } = useCart();
  const savings = product.priceList - product.priceCash;
  const installmentAmount = Math.round(product.priceList / 3);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className="bg-white rounded-lg border border-[#e5e0d8] overflow-hidden hover-luxury-lift cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full h-64 bg-[#f7f5f0] flex items-center justify-center p-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-2 hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-center p-6 bg-[#efece6] rounded border border-dashed border-gray-300 w-full h-full flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 font-medium tracking-wider">Foto próximamente</span>
              <span className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Joyas Laure</span>
            </div>
          )}

          {/* Top Left SKU Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="bg-[#121212] text-[#c5a059] text-[10px] font-mono font-semibold px-2 py-0.5 rounded shadow">
              {product.code}
            </span>
          </div>

          {/* Top Right 20% OFF Hook Badge */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <span className="bg-rose-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded shadow-md border border-rose-700">
              20% OFF Contado
            </span>
          </div>
        </div>

        {/* Info Container */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c5a059] bg-[#fcf8f0] px-2 py-0.5 rounded">
              {product.category.name}
            </span>
            <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
              {product.material.name}
            </span>
          </div>

          <h3 className="font-serif text-base font-bold text-gray-900 line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Installments Section */}
      <div className="p-5 pt-0 border-t border-gray-100 mt-auto">
        {/* Cash / Transfer Highlighted Price */}
        <div className="bg-[#f0fdf4] p-3 rounded-lg border border-emerald-300 mb-3 shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">
              Precio Contado:
            </span>
            <span className="text-xl font-bold text-emerald-800 font-mono">
              ${product.priceCash.toLocaleString('es-AR')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Efectivo o Transferencia</p>

          {savings > 0 && (
            <div className="mt-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 inline-block">
              Ahorrás ${savings.toLocaleString('es-AR')} abonando contado
            </div>
          )}
        </div>

        {/* Credit Card Installments */}
        <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs mb-4">
          <div className="flex items-center justify-between text-gray-700">
            <span className="font-semibold flex items-center gap-1">
              <CreditCardIcon className="w-3.5 h-3.5 text-gray-500" />
              3 Cuotas Sin Interés:
            </span>
            <span className="font-bold font-mono text-gray-900">
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
            className="flex-1 bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider py-2.5 rounded transition-colors shadow flex items-center justify-center gap-2"
          >
            <CartIcon className="w-4 h-4 text-black" />
            <span>Agregar al Carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
}

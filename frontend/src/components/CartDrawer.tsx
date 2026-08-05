'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { CartIcon, TrashIcon } from '@/components/icons/SvgIcons';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCash,
    totalList,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
    itemCount,
  } = useCart();

  const router = useRouter();
  
  if (!isCartOpen) return null;


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative border-l border-[#e8e3da]">
        {/* Cart Header */}
        <div className="p-5 border-b border-[#33312e] bg-gradient-to-r from-[#1a1918] to-[#252321] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CartIcon className="w-5 h-5 text-gold" />
            <span className="font-serif font-bold text-lg text-white">Carrito de Compras</span>
            <span className="badge-gold text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cart Body */}
        <div className="p-5 flex-grow overflow-y-auto divide-y divide-[#e8e3da]/60">
          {cart.length > 0 ? (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="py-4 flex gap-4 items-center">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-[#fcfbf9] rounded-xl border border-[#e8e3da] relative shrink-0 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-[9px] text-gray-400">Sin foto</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-mono font-bold text-gold">
                    {product.code}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#1a1918] truncate">
                    {product.name}
                  </h4>
                  <div className="text-xs font-bold text-emerald-700 font-numeric mt-0.5">
                    ${product.priceCash.toLocaleString('es-AR')}{' '}
                    <span className="text-[10px] text-gray-400 font-normal line-through">
                      ${product.priceList.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#e8e3da] rounded-full overflow-hidden bg-[#fcfbf9]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2.5 py-0.5 text-xs bg-[#f5f2eb] hover:bg-[#e8e3da] font-bold cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold font-sans">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2.5 py-0.5 text-xs bg-[#f5f2eb] hover:bg-[#e8e3da] font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 ml-auto cursor-pointer transition-colors"
                      title="Eliminar del carrito"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <CartIcon className="w-12 h-12 text-gold/60 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-[#1a1918]">Tu carrito está vacío</p>
              <p className="text-xs text-gray-500 mt-1 font-sans">Explorá nuestro catálogo para agregar joyas.</p>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#e8e3da] bg-[#fcfbf9] space-y-3.5">
            {/* 20% OFF Highlight */}
            <div className="bg-[#f0fdf4] border border-emerald-300 p-3.5 rounded-2xl text-emerald-950 text-xs shadow-xs">
              <div className="flex justify-between items-baseline font-bold">
                <span>Total Contado (20% OFF):</span>
                <span className="text-xl font-numeric text-emerald-800 font-extrabold">
                  ${totalCash.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Efectivo o Transferencia bancaria</p>

              {totalSavings > 0 && (
                <div className="mt-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block">
                  Estás ahorrando ${totalSavings.toLocaleString('es-AR')}
                </div>
              )}
            </div>

            {/* Installments info */}
            <div className="flex justify-between items-center text-xs text-gray-700 pt-1 font-sans">
              <span>Precio Lista en Cuotas:</span>
              <span className="font-bold font-numeric text-[#1a1918]">${totalList.toLocaleString('es-AR')}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans">
              O 3 cuotas sin interés de ${Math.round(totalList / 3).toLocaleString('es-AR')} (Todos los bancos)
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                router.push('/checkout');
              }}
              className="w-full btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider py-4 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ir al Checkout / Pagar</span>
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-[11px] text-gray-500 hover:text-rose-600 underline cursor-pointer transition-colors font-sans"
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { CartIcon, WhatsAppIcon, TrashIcon } from '@/components/icons/SvgIcons';

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

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    const itemsList = cart
      .map((item) => `• ${item.quantity}x ${item.product.name} (SKU: ${item.product.code}) - $${item.product.priceCash.toLocaleString('es-AR')}`)
      .join('%0A');

    const message = `Hola Laure Joyas! Quiero realizar la siguiente compra:%0A%0A${itemsList}%0A%0ATotal Contado (20% OFF): $${totalCash.toLocaleString('es-AR')}%0AForma de pago elegida: Transferencia / Efectivo en local Salsipuedes.`;

    window.open(`https://wa.me/5493510000000?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative border-l border-gray-200">
        {/* Cart Header */}
        <div className="p-5 border-b border-gray-200 bg-[#121212] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CartIcon className="w-5 h-5 text-[#c5a059]" />
            <span className="font-serif font-bold text-lg text-white">Carrito de Compras</span>
            <span className="bg-[#c5a059] text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Cart Body */}
        <div className="p-5 flex-grow overflow-y-auto divide-y divide-gray-100">
          {cart.length > 0 ? (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="py-4 flex gap-4 items-center">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-[#f7f5f0] rounded border border-gray-200 relative shrink-0 flex items-center justify-center">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">Sin foto</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-mono font-bold text-[#c5a059]">
                    {product.code}
                  </span>
                  <h4 className="font-serif text-xs font-bold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                    ${product.priceCash.toLocaleString('es-AR')}{' '}
                    <span className="text-[10px] text-gray-400 font-normal line-through">
                      ${product.priceList.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 ml-auto"
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
              <CartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-serif text-sm font-bold text-gray-800">Tu carrito está vacío</p>
              <p className="text-xs text-gray-500 mt-1">Explorá nuestro catálogo para agregar joyas.</p>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-[#faf8f3] space-y-3">
            {/* 20% OFF Highlight */}
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded-lg text-emerald-900 text-xs">
              <div className="flex justify-between items-baseline font-bold">
                <span>Total Contado (20% OFF):</span>
                <span className="text-lg font-mono text-emerald-950 font-extrabold">
                  ${totalCash.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">Efectivo o Transferencia bancaria</p>

              {totalSavings > 0 && (
                <div className="mt-1 text-[10px] font-bold text-emerald-800">
                  Estás ahorrando ${totalSavings.toLocaleString('es-AR')}
                </div>
              )}
            </div>

            {/* Installments info */}
            <div className="flex justify-between items-center text-xs text-gray-600 pt-1">
              <span>Precio Lista en Cuotas:</span>
              <span className="font-semibold font-mono">${totalList.toLocaleString('es-AR')}</span>
            </div>
            <p className="text-[10px] text-gray-500">
              O 3 cuotas sin interés de ${Math.round(totalList / 3).toLocaleString('es-AR')} (Todos los bancos)
            </p>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded shadow flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Finalizar Pedido por WhatsApp</span>
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-[11px] text-gray-500 hover:text-gray-700 underline"
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

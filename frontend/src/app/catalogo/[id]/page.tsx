'use client';

import { useParams, useRouter } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { CartIcon, WhatsAppIcon, HeartIcon, HeartFilledIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f5]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="font-serif text-2xl font-bold mb-4">Producto no encontrado</h2>
          <button 
            onClick={() => router.push('/catalogo')}
            className="bg-[#c5a059] text-black font-bold uppercase px-6 py-3 rounded shadow"
          >
            Volver al Catálogo
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const savings = product.priceList - product.priceCash;
  const isRing = product.category.id === 'CAT_RINGS' || product.category.name === 'Anillos';
  const isFav = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleWhatsAppConsult = async () => {
    const message = `Hola Laure Joyas! 👋 Me interesa el producto *[${product.code}] ${product.name}* ($${product.priceCash.toLocaleString('es-AR')} contado). ¿Tienen disponibilidad?`;
    
    if (BUSINESS_CONFIG.whatsappEnabled) {
      // Direct WhatsApp link (ready for when official business number is configured)
      window.open(`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      // Fallback: Copy inquiry text to clipboard and notify customer
      try {
        await navigator.clipboard.writeText(message);
        showToast('✓ Consulta copiada al portapapeles. ¡Contactanos en el local!', 'success');
      } catch {
        showToast(`Consulta: SKU ${product.code} - ${product.name}`, 'info');
      }
    }
  };

  const handleAddToCartAndBuy = () => {
    if (isOutOfStock) {
      showToast('Este producto no tiene stock disponible', 'warning');
      return;
    }
    addToCart(product);
    showToast(`${product.name} agregado al carrito`, 'success');
    router.push('/checkout');
  };

  const handleAddToCartContinue = () => {
    if (isOutOfStock) {
      showToast('Este producto no tiene stock disponible', 'warning');
      return;
    }
    addToCart(product);
    showToast(`${product.name} agregado al carrito`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(
      isFav ? 'Eliminado de favoritos' : '❤️ Guardado en favoritos',
      isFav ? 'info' : 'success'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-gray-900 transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Columna Izquierda: Imagen */}
          <div className={`bg-white rounded-lg border border-[#e5e0d8] p-8 flex items-center justify-center aspect-square relative shadow-sm ${isOutOfStock ? 'opacity-75' : ''}`}>
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-contain p-4 ${isOutOfStock ? 'grayscale' : ''}`}
              />
            ) : (
              <div className="text-center p-6 bg-[#efece6] rounded border border-dashed border-gray-300 w-full h-full flex flex-col items-center justify-center">
                <span className="text-sm text-gray-500 font-medium tracking-wider">Foto próximamente</span>
              </div>
            )}
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-lg">
                <span className="bg-[#121212] text-white font-bold text-lg uppercase tracking-widest px-6 py-3 rounded shadow-lg border border-gray-600">
                  Sin Stock
                </span>
              </div>
            )}

            {/* Top Right 20% OFF Hook Badge */}
            {!isOutOfStock && (
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-20">
                <span className="bg-rose-600 text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded shadow-md border border-rose-700">
                  20% OFF Contado
                </span>
              </div>
            )}
          </div>

          {/* Columna Derecha: Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-[#121212] text-[#c5a059] text-xs font-mono font-semibold px-2 py-1 rounded shadow">
                {product.code}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059] bg-[#fcf8f0] px-2 py-1 rounded">
                {product.category.name}
              </span>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                {product.material.name}
              </span>
              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  isFav
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                {isFav ? <HeartFilledIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                <span>{isFav ? 'En Favoritos' : 'Favorito'}</span>
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Stock Indicator */}
            {isOutOfStock ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg mb-6 text-center">
                <p className="text-rose-800 font-bold text-sm">Producto sin stock actualmente</p>
                <p className="text-rose-600 text-xs mt-1">Consultanos por WhatsApp para conocer disponibilidad</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  product.stock > 3
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.stock > 3 ? 'En Stock' : `¡Últimas ${product.stock} unidades!`}
                </span>
              </div>
            )}

            <div className="bg-[#faf8f3] p-5 rounded-lg border border-[#e5dfd5] mb-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Precio Contado</p>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">Efectivo / Transferencia</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-800 font-mono">
                    ${product.priceCash.toLocaleString('es-AR')}
                  </span>
                  {savings > 0 && (
                    <p className="text-xs font-bold text-emerald-700 mt-1 bg-emerald-100 inline-block px-2 py-0.5 rounded border border-emerald-200">
                      Ahorrás ${savings.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span className="font-medium">Precio Lista (Tarjetas / Cuotas):</span>
                <span className="font-semibold text-gray-800 font-mono text-lg">
                  ${product.priceList.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right">O 3 cuotas sin interés de ${Math.round(product.priceList / 3).toLocaleString('es-AR')}</p>
            </div>

            {/* Acciones */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => router.push('/catalogo')}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-sm uppercase py-4 rounded btn-animate cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleAddToCartAndBuy}
                disabled={isOutOfStock}
                className={`flex-1 font-bold text-sm uppercase tracking-wider py-4 rounded shadow-lg flex items-center justify-center gap-2 btn-animate ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#c5a059] hover:bg-[#a8843e] text-black cursor-pointer'
                }`}
              >
                <CartIcon className="w-5 h-5" />
                <span>Comprar</span>
              </button>
            </div>
            
            <button
              onClick={handleAddToCartContinue}
              disabled={isOutOfStock}
              className={`mt-4 w-full font-bold text-xs uppercase tracking-wider py-3 rounded shadow flex items-center justify-center gap-2 btn-animate ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#121212] hover:bg-black text-[#c5a059] cursor-pointer'
              }`}
            >
              <span>Agregar al carrito y seguir comprando</span>
            </button>

            {/* WhatsApp Consult Button */}
            <button
              onClick={handleWhatsAppConsult}
              className="mt-3 w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded shadow-lg flex items-center justify-center gap-2 btn-whatsapp cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Consultar por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Sección Especial: Guía de Talles para Anillos */}
        {isRing && (
          <div className="mt-16 bg-white p-8 rounded-xl border border-gray-200 shadow-md">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6 text-center">
              📏 ¿No sabes tu talle? Medilo en casa
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#c5a059] text-black font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Prepará los materiales</h4>
                    <p className="text-sm text-gray-600 mt-1">Cortá una tirita de papel de unos 10cm de largo, o buscá un trozo de hilo que no sea elástico.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#c5a059] text-black font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Envolvé tu dedo</h4>
                    <p className="text-sm text-gray-600 mt-1">Envolvelo en el dedo donde vas a usar el anillo. Asegurate de que pase por el nudillo sin apretar demasiado.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#c5a059] text-black font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Hacé una marca</h4>
                    <p className="text-sm text-gray-600 mt-1">Marcá con una birome exactamente el punto donde el papel o el hilo se cruza formando un círculo completo.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#c5a059] text-black font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Medí la distancia</h4>
                    <p className="text-sm text-gray-600 mt-1">Estirá el papel sobre una regla y medí los milímetros desde la punta hasta tu marca. Agregá esta medida (ej. 54mm) como nota en el checkout o envianosla por WhatsApp al finalizar el pedido.</p>
                  </div>
                </div>
              </div>

              <div className="aspect-video w-full rounded-lg overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center relative shadow-inner">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/PudJ5h3vWvQ?rel=0" 
                  title="Guía para medir tu anillo" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

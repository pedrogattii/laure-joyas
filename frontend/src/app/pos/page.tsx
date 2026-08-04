'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import StockAdjustModal from '@/components/admin/StockAdjustModal';
import POSRegisterModal from '@/components/admin/POSRegisterModal';
import DailyCashClosureModal from '@/components/admin/DailyCashClosureModal';
import ProductFormModal from '@/components/admin/ProductFormModal';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import type { ProductItem } from '@/lib/types';
import {
  CashIcon,
  CreditCardIcon,
  SearchIcon,
  PlusIcon,
  ClockIcon,
  WifiOffIcon,
  UserIcon,
} from '@/components/icons/SvgIcons';
import {
  getOfflineQueueCount,
  isOnline,
} from '@/lib/offlineQueue';
import { getActiveSessionSales } from '@/lib/cashClosureManager';
import {
  useSupabaseProducts,
  useSupabaseSales,
  useSupabaseCashClosures,
  registerSupabaseSale,
  registerSupabaseProduct,
  updateSupabaseProductStock,
  deleteSupabaseProduct,
} from '@/lib/supabaseSync';

export default function MobilePosAppPage() {
  const { user, loginAs } = useAuth();
  const { showToast } = useToast();

  const { products, fetchProducts } = useSupabaseProducts();
  const { sales: salesHistory, fetchSales } = useSupabaseSales();
  const { closures, fetchClosures } = useSupabaseCashClosures();

  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isCashClosureOpen, setIsCashClosureOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<ProductItem | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);

  const handleOpenStockModal = (product: ProductItem) => {
    setSelectedProductForStock(product);
    setIsStockModalOpen(true);
  };

  const handleQuickStockChange = async (product: ProductItem, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const ok = await updateSupabaseProductStock(product.id, newStock);
    if (ok) {
      showToast(`Stock de ${product.code} actualizado a ${newStock} un.`, 'success');
      fetchProducts();
    } else {
      showToast('Error al actualizar el stock', 'error');
    }
  };

  const handleSaveStock = async (productId: string, newStock: number) => {
    const ok = await updateSupabaseProductStock(productId, newStock);
    if (ok) {
      showToast('Stock actualizado correctamente', 'success');
      fetchProducts();
    } else {
      showToast('Error al actualizar el stock', 'error');
    }
  };

  const handleDeleteProduct = async (product: ProductItem) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar el producto "${product.name}" (${product.code}) del stock?\n\nEsta acción quitará el producto del inventario y del catálogo.`
    );
    if (!confirmed) return;

    const ok = await deleteSupabaseProduct(product.id);
    if (ok) {
      showToast(`Producto ${product.code} eliminado correctamente`, 'success');
      fetchProducts();
    } else {
      showToast('Error al eliminar el producto', 'error');
    }
  };

  const [activeTab, setActiveTab] = useState<'cobrar' | 'stock' | 'cierre' | 'dashboard'>('cobrar');
  const [searchQuery, setSearchQuery] = useState('');
  const [online, setOnline] = useState(() => (typeof window !== 'undefined' ? isOnline() : true));
  const [offlinePending] = useState(() => (typeof window !== 'undefined' ? getOfflineQueueCount() : 0));
  const [showInstallGuide, setShowInstallGuide] = useState(true);
  const [isStandalone] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    }
    return false;
  });

  // Load sales history & connection state & inventory stock & detect PWA standalone mode
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      showToast('Conexión restablecida', 'success');
    };
    const handleOffline = () => {
      setOnline(false);
      showToast('Sin conexión — ventas resguardadas localmente', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Handle registering a new sale
  const handlePOSSaleSuccess = async (saleData: {
    product: ProductItem;
    quantity: number;
    paymentMethod: string;
    totalAmount: number;
  }) => {
    const success = await registerSupabaseSale({
      productId: saleData.product.id,
      quantity: saleData.quantity,
      totalAmount: saleData.totalAmount,
      paymentMethod: saleData.paymentMethod,
    });

    if (success) {
      showToast(
        `✓ Venta cobrada: ${saleData.quantity}x ${saleData.product.name} ($${saleData.totalAmount.toLocaleString('es-AR')})`,
        'success'
      );
      fetchSales();
      fetchProducts();
    } else {
      showToast('Error al procesar la venta.', 'error');
    }
  };

  const handleAddProduct = async (newProduct: ProductItem) => {
    const success = await registerSupabaseProduct({
      code: newProduct.code,
      name: newProduct.name,
      description: newProduct.description,
      priceList: newProduct.priceList,
      priceCash: newProduct.priceCash,
      categoryId: newProduct.category.id,
      materialId: newProduct.material.id,
      stock: newProduct.stock,
      image: newProduct.image,
    });
    if (success) {
      showToast(`✓ Producto "${newProduct.name}" guardado exitosamente en Supabase.`, 'success');
      fetchProducts();
    } else {
      showToast('Error al guardar el producto en Supabase.', 'error');
    }
  };

  // Active cash session sales calculations
  const activeSessionSales = useMemo(
    () => getActiveSessionSales(salesHistory, closures),
    [salesHistory, closures]
  );
  const todayTotal = useMemo(
    () => activeSessionSales.reduce((acc, s) => acc + s.totalAmount, 0),
    [activeSessionSales]
  );

  // Filtered stock list
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
    return (
      <div className="min-h-screen flex flex-col bg-[#121212] text-white font-sans justify-center items-center p-4">
        <div className="bg-[#1e1e1e] p-8 rounded-2xl border border-[#333] shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Acceso Restringido POS</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            La caja registradora requiere inicio de sesión con una cuenta autorizada de Empleado o Administrador.
          </p>
          <div className="pt-4">
            <a
              href="/login"
              className="w-full block bg-[#c5a059] text-black font-extrabold text-xs uppercase py-3.5 rounded-xl shadow cursor-pointer text-center"
            >
              Ingresar Credenciales
            </a>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = user;

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white font-sans pb-24 select-none">
      {/* Top App Bar */}
      <header className="bg-[#1e1e1e] border-b border-[#2a2a2a] p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center bg-[#121212] shrink-0 shadow">
              <span className="text-[#c5a059] font-serif text-lg font-bold">LJ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-white tracking-wide">
                  LJ POS App
                </span>
                <span className="bg-[#c5a059] text-black text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                  Isla Super Mami
                </span>
              </div>
              <span className="text-xs text-gray-400 block">
                Operaria: <strong className="text-gray-200">{currentUser.name.split(' ')[0]}</strong>
              </span>
            </div>
          </div>

          {/* Quick Role Switcher for Test */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => loginAs(currentUser.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN')}
              className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-[10px] text-[#c5a059] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 active:scale-95 btn-animate"
              title="Cambiar usuario de prueba"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{currentUser.role === 'ADMIN' ? 'Adriana' : 'Martina'}</span>
            </button>
          </div>
        </div>

        {/* Connection Offline Indicator */}
        {!online && (
          <div className="mt-3 bg-amber-500 text-black text-[11px] font-extrabold uppercase px-3 py-1.5 rounded flex items-center justify-center gap-2 animate-fadeIn">
            <WifiOffIcon className="w-4 h-4" />
            <span>Modo Sin Conexión — Las ventas se guardan en el cel</span>
          </div>
        )}

        {offlinePending > 0 && online && (
          <div className="mt-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded text-center">
            ✓ {offlinePending} venta(s) guardadas localmente
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="max-w-lg mx-auto w-full p-4 flex-grow space-y-6">
        {/* PWA Install Banner (Visible in browser, hidden when installed as App) */}
        {!isStandalone && (
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold text-xs text-white">¿Tener como App en tu cel?</p>
                  <p className="text-[11px] text-gray-400">Instalá el acceso rápido en tu pantalla de inicio</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(!showInstallGuide)}
                className="text-xs text-[#c5a059] font-bold underline px-2 py-1 btn-animate"
              >
                {showInstallGuide ? 'Ocultar' : 'Ver cómo'}
              </button>
            </div>

            {showInstallGuide && (
              <div className="mt-3 pt-3 border-t border-[#333] text-xs text-gray-300 space-y-2 animate-fadeIn">
                <p className="font-bold text-[#c5a059]">En iPhone (Safari):</p>
                <p className="text-[11px] text-gray-400">Tocá el botón Compartir ⎋ → &quot;Agregar a inicio&quot; ➕</p>
                <p className="font-bold text-[#c5a059] pt-1">En Android (Chrome):</p>
                <p className="text-[11px] text-gray-400">Tocá los 3 puntos ⋮ → &quot;Instalar aplicación&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: COBRAR & ACCIONES RAPIDAS */}
        {activeTab === 'cobrar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Primary Touch Action: OPEN COBRAR MODAL */}
            <button
              onClick={() => setIsPOSModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-lg uppercase tracking-wider py-6 px-4 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-2 border-2 border-emerald-400 btn-animate"
            >
              <CreditCardIcon className="w-9 h-9 text-white" />
              <span>⚡ REGISTRAR NUEVA VENTA</span>
              <span className="text-xs font-normal text-emerald-100 uppercase tracking-normal">
                Descuenta stock de la isla en tiempo real
              </span>
            </button>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333]">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Ventas de Hoy
                </span>
                <span className="font-serif text-2xl font-bold text-white">
                  {activeSessionSales.length}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">transacciones</span>
              </div>

              <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333]">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Total Facturado
                </span>
                <span className="font-mono text-xl font-bold text-emerald-400 block">
                  ${todayTotal.toLocaleString('es-AR')}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Caja abierta</span>
              </div>
            </div>

            {/* Today's Transactions Timeline */}
            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333]">
              <div className="flex items-center justify-between mb-3 border-b border-[#2a2a2a] pb-2">
                <h3 className="font-serif text-sm font-bold text-gray-200">
                  Últimas Ventas ({activeSessionSales.length})
                </h3>
                <button
                  onClick={() => setIsCashClosureOpen(true)}
                  className="text-xs font-bold text-[#c5a059] hover:underline flex items-center gap-1 btn-animate"
                >
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>Cerrar Caja</span>
                </button>
              </div>

              {activeSessionSales.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {activeSessionSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-[#121212] rounded-lg border border-[#2a2a2a] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{sale.productName}</p>
                        <p className="text-[10px] text-gray-400">
                          {sale.date} • {sale.paymentMethod} • {sale.quantity}un.
                        </p>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm shrink-0 ml-2">
                        ${sale.totalAmount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">
                  Aún no se registraron ventas hoy en la isla.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTAR & BUSCAR STOCK */}
        {activeTab === 'stock' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-white">Stock en la Isla</h2>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="bg-[#c5a059] text-black font-bold text-xs uppercase px-3 py-2 rounded flex items-center gap-1 btn-animate"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Cargar</span>
                </button>
              )}
            </div>

            {/* Mobile Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por SKU o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c5a059]"
              />
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>

            {/* Mobile Stock List */}
            <div className="space-y-2.5">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1e1e1e] p-3.5 rounded-xl border border-[#333] flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-[#121212] rounded-lg relative shrink-0 overflow-hidden border border-[#2a2a2a] flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[8px] text-gray-500">Sin foto</span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#c5a059]">
                      {item.code}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${item.priceCash.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Contado
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickStockChange(item, -1)}
                        title="Restar 1 unidad"
                        className="w-6.5 h-6.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleOpenStockModal(item)}
                        title="Hacé clic para cambiar la cantidad exacta"
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${
                          item.stock > 3
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : item.stock > 0
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {item.stock} un. ✏️
                      </button>
                      <button
                        onClick={() => handleQuickStockChange(item, 1)}
                        title="Sumar 1 unidad"
                        className="w-6.5 h-6.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(item)}
                      title="Eliminar producto"
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/60"
                    >
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CIERRE DE CAJA */}
        {activeTab === 'cierre' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-[#333] space-y-4">
              <h2 className="font-serif text-lg font-bold text-white">Arqueo y Cierre del Día</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generá el reporte agrupado por medio de pago (Efectivo, Transferencia, Fiserv, Mercado Pago) y compartilo directamente por WhatsApp.
              </p>

              <button
                onClick={() => setIsCashClosureOpen(true)}
                className="w-full bg-[#121212] hover:bg-black text-[#c5a059] border border-[#c5a059] font-bold text-sm uppercase py-4 rounded-xl shadow flex items-center justify-center gap-2 btn-animate"
              >
                <ClockIcon className="w-5 h-5 text-[#c5a059]" />
                <span>Abrir Ventana de Cierre</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DASHBOARD (ADMIN / ADRIANA ONLY) */}
        {activeTab === 'dashboard' && currentUser.role === 'ADMIN' && (
          <div className="space-y-4 animate-fadeIn bg-white text-gray-900 p-4 rounded-2xl shadow-xl border border-[#333]">
            <div className="border-b border-gray-200 pb-2 mb-2">
              <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest block">
                Acceso Exclusivo Dueña (Adriana)
              </span>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                Dashboard &amp; Métricas del Negocio
              </h2>
            </div>
            <AnalyticsDashboard products={products} salesHistory={salesHistory} />
          </div>
        )}
      </main>

      {/* Bottom App Navigation Bar (Mobile Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1e1e1e] border-t border-[#2a2a2a] p-2 max-w-lg mx-auto shadow-2xl">
        <div className={`grid ${currentUser.role === 'ADMIN' ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
          <button
            onClick={() => setActiveTab('cobrar')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition-all btn-animate ${
              activeTab === 'cobrar'
                ? 'bg-[#c5a059] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CashIcon className="w-5 h-5 mb-0.5" />
            <span>Cobrar</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition-all btn-animate ${
              activeTab === 'stock'
                ? 'bg-[#c5a059] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SearchIcon className="w-5 h-5 mb-0.5" />
            <span>Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('cierre')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition-all btn-animate ${
              activeTab === 'cierre'
                ? 'bg-[#c5a059] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ClockIcon className="w-5 h-5 mb-0.5" />
            <span>Cierre</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition-all btn-animate ${
                activeTab === 'dashboard'
                  ? 'bg-[#c5a059] text-black shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-5 h-5 mb-0.5" />
              <span>Métricas</span>
            </button>
          )}
        </div>
      </nav>

      {/* Modals */}
      <POSRegisterModal
        isOpen={isPOSModalOpen}
        onClose={() => setIsPOSModalOpen(false)}
        products={products}
        onSaleSuccess={handlePOSSaleSuccess}
      />

      <DailyCashClosureModal
        isOpen={isCashClosureOpen}
        onClose={() => setIsCashClosureOpen(false)}
        salesHistory={activeSessionSales}
        operatorName={currentUser.name}
        onSessionStatusChange={() => {
          fetchClosures();
          fetchSales();
        }}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
        existingCount={products.length}
      />

      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProductForStock}
        onSaveStock={handleSaveStock}
      />
    </div>
  );
}

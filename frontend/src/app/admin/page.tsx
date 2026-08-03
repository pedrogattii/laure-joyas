'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductFormModal from '@/components/admin/ProductFormModal';
import POSRegisterModal from '@/components/admin/POSRegisterModal';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import DailyCashClosureModal from '@/components/admin/DailyCashClosureModal';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import type { ProductItem, SalesRecord } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon, CreditCardIcon, ClockIcon, WifiOffIcon } from '@/components/icons/SvgIcons';
import {
  getOfflineQueueCount,
  isOnline,
} from '@/lib/offlineQueue';
import { getActiveSessionSales } from '@/lib/cashClosureManager';
import { useSupabaseProducts, useSupabaseSales, useSupabaseCashClosures, registerSupabaseSale, registerSupabaseProduct } from '@/lib/supabaseSync';

export default function AdminPage() {
  const { user, loginAs, logout } = useAuth();
  const { showToast } = useToast();

  const { products, loading: productsLoading, fetchProducts } = useSupabaseProducts();
  const { sales: salesHistory, loading: salesLoading, fetchSales } = useSupabaseSales();
  const { closures, fetchClosures } = useSupabaseCashClosures();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'inventory'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState<boolean>(false);
  const [isCashClosureOpen, setIsCashClosureOpen] = useState<boolean>(false);

  const [online, setOnline] = useState(true);
  const [offlinePending, setOfflinePending] = useState(0);

  // Auto-set initial active tab according to role
  const currentUserRole = user?.role || 'ADMIN';

  // Load connection status
  useEffect(() => {

    setOnline(isOnline());
    setOfflinePending(getOfflineQueueCount());

    const handleOnline = () => {
      setOnline(true);
      showToast('Conexión restablecida', 'success');
    };
    const handleOffline = () => {
      setOnline(false);
      showToast('Sin conexión — las ventas se guardarán localmente', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle adding new product
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

  // Handle registering new in-person sale (Caja Rápida)
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
        `✓ Venta registrada: ${saleData.quantity}x ${saleData.product.name} — $${saleData.totalAmount.toLocaleString('es-AR')}`,
        'success'
      );
      fetchSales();
      fetchProducts();
    } else {
      showToast('Error al registrar la venta. Intenta nuevamente.', 'error');
    }
  };

  // Get active cash session sales for daily reporting
  const activeSessionSales = getActiveSessionSales(salesHistory, closures);
  const todayTotal = activeSessionSales.reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      {/* Offline Banner */}
      {!online && (
        <div className="bg-amber-500 text-black text-center py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 animate-fadeIn">
          <WifiOffIcon className="w-4 h-4" />
          <span>Sin conexión — Las ventas se guardan en tu celular</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-[#121212] text-white py-8 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[#c5a059] text-xs font-semibold uppercase tracking-widest block">
                Sistema de Gestión & Inventario Cruzado
              </span>
              <span className="bg-[#222] text-[#c5a059] border border-[#444] text-[10px] font-bold px-2 py-0.5 rounded">
                Rol: {currentUserRole}
              </span>
              {offlinePending > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                  {offlinePending} ventas pendientes de sincronizar
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {user ? user.name : 'Panel de Administración'} — Salsipuedes
            </h1>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-[#1e1e1e] p-2 rounded-lg border border-[#333]">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">
              Simular Rol:
            </span>
            <button
              onClick={() => loginAs('ADMIN')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                currentUserRole === 'ADMIN'
                  ? 'bg-[#c5a059] text-black shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Dueña (Admin)
            </button>
            <button
              onClick={() => loginAs('EMPLOYEE')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                currentUserRole === 'EMPLOYEE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Empleado (Caja)
            </button>
            {user && (
              <button
                onClick={logout}
                className="text-[11px] text-gray-400 hover:text-rose-400 underline px-2"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {/* PWA App Install Banner */}
        <div className="mb-6 bg-[#121212] text-white p-4 rounded-xl border border-[#c5a059]/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#c5a059]">¿Usás el celular en el local? Instalá la App LJ POS</h3>
              <p className="text-xs text-gray-300 mt-0.5">Acceso rápido a pantalla completa en iOS (Safari) y Android (Chrome).</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              href="/pos"
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase px-4 py-2.5 rounded shadow btn-animate text-center w-full sm:w-auto"
            >
              Abrir Modo App Móvil (/pos)
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-300 mb-8 bg-white p-2 rounded-t-lg shadow-sm gap-2">
          <div className="flex gap-2 flex-wrap">
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#121212] text-[#c5a059] shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard & Gráficos
              </button>
            )}

            <button
              onClick={() => setActiveTab('pos')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'pos'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Registrar Venta (Caja Rápida)
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'inventory'
                  ? 'bg-[#121212] text-[#c5a059] shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inventario & Carga ({products.length})
            </button>
          </div>

          <div className="flex gap-2 p-2">
            <button
              onClick={() => setIsCashClosureOpen(true)}
              className="bg-[#121212] hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded shadow flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <ClockIcon className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden sm:inline">Cerrar Caja</span>
            </button>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded shadow flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <PlusIcon className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Cargar Producto</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD & GRAPHICS (ADMIN ONLY) */}
        {activeTab === 'dashboard' && currentUserRole === 'ADMIN' && (
          <AnalyticsDashboard products={products} salesHistory={salesHistory} />
        )}

        {/* TAB 2: CAJA RAPIDA / POS LOCAL */}
        {activeTab === 'pos' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e5e0d8] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
                  Punto de Venta Local (Isla Super Mami N°4)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  Módulo de Caja Rápida
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Cada venta registrada descuenta automáticamente el stock del inventario cruzado.
                </p>
              </div>

              <button
                onClick={() => setIsPOSModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider px-6 py-4 rounded-lg shadow flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <CreditCardIcon className="w-5 h-5 text-white" />
                <span>Cobrar Venta</span>
              </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#fbf9f5] p-5 rounded-lg border border-[#e5dfd5]">
                <span className="text-xs font-bold text-gray-600 uppercase block mb-1">Ventas del Día</span>
                <span className="font-serif text-2xl font-bold text-gray-900">
                  {activeSessionSales.length} transacciones
                </span>
              </div>

              <div className="bg-[#fbf9f5] p-5 rounded-lg border border-[#e5dfd5]">
                <span className="text-xs font-bold text-gray-600 uppercase block mb-1">Total Facturado Hoy</span>
                <span className="font-serif text-2xl font-bold text-emerald-800 font-mono">
                  ${todayTotal.toLocaleString('es-AR')}
                </span>
              </div>

              <div className="bg-[#fbf9f5] p-5 rounded-lg border border-[#e5dfd5]">
                <span className="text-xs font-bold text-gray-600 uppercase block mb-1">Sucursal Física</span>
                <span className="font-serif text-base font-bold text-[#c5a059] block mt-1">
                  Isla 1 — Super Mami N°4
                </span>
              </div>
            </div>

            {/* Recent Sales Table (mobile-friendly list) */}
            {activeSessionSales.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Últimas ventas de esta caja</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeSessionSales.slice(0, 10).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{sale.productName}</p>
                        <p className="text-gray-500">{sale.date} • {sale.paymentMethod} • {sale.quantity}un.</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 shrink-0 ml-3">
                        ${sale.totalAmount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY TABLE */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl border border-[#e5e0d8] shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-gray-100 bg-[#fbf9f5] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Inventario Completo en Stock
              </h3>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-[#121212] text-[#c5a059] font-bold text-xs uppercase px-3 py-1.5 rounded flex items-center gap-1"
              >
                <PlusIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Cargar Producto</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121212] text-white uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Código SKU</th>
                    <th className="py-3 px-4">Imagen</th>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4 text-right">Precio Contado (20% OFF)</th>
                    <th className="py-3 px-4 text-right">Precio Lista (3 Cuotas)</th>
                    <th className="py-3 px-4 text-center">Stock Isla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fcf8f2] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#c5a059]">
                        {item.code}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.image ? (
                          <div className="w-10 h-10 relative bg-[#f4f2ee] rounded overflow-hidden border border-gray-200">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic bg-gray-100 px-2 py-1 rounded">
                            Sin foto
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {item.category.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-[#fcf8f0] text-[#a8843e] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#ede3cf]">
                          {item.material.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-800 font-mono">
                        ${item.priceCash.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        ${item.priceList.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.stock > 3
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.stock} un.
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
        existingCount={products.length}
      />

      {/* POS Register Modal */}
      <POSRegisterModal
        isOpen={isPOSModalOpen}
        onClose={() => setIsPOSModalOpen(false)}
        products={products}
        onSaleSuccess={handlePOSSaleSuccess}
      />

      {/* Daily Cash Closure Modal */}
      <DailyCashClosureModal
        isOpen={isCashClosureOpen}
        onClose={() => setIsCashClosureOpen(false)}
        salesHistory={activeSessionSales}
        operatorName={user ? user.name : 'Dueña (Adriana)'}
        onSessionStatusChange={() => {
          fetchClosures();
          fetchSales();
        }}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GearIcon,
  CartIcon,
  UserIcon,
  CreditCardIcon,
  ClockIcon,
  WifiOffIcon,
} from '@/components/icons/SvgIcons';

interface AdminAppShellProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'pos' | 'inventory';
  onTabChange: (tab: 'dashboard' | 'pos' | 'inventory') => void;
  onOpenProductModal?: () => void;
  onOpenCashClosureModal?: () => void;
  onOpenUserManagementModal?: () => void;
  online?: boolean;
  offlinePendingCount?: number;
}

export default function AdminAppShell({
  children,
  activeTab,
  onTabChange,
  onOpenProductModal,
  onOpenCashClosureModal,
  onOpenUserManagementModal,
  online = true,
  offlinePendingCount = 0,
}: AdminAppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Analíticas & Métricas',
      icon: '📊',
      action: () => onTabChange('dashboard'),
      active: activeTab === 'dashboard' && pathname === '/admin',
    },
    {
      id: 'pos',
      label: 'Punto de Venta (POS)',
      icon: '🛒',
      href: '/pos',
      active: pathname === '/pos',
    },
    {
      id: 'inventory',
      label: 'Inventario & Stock',
      icon: '📦',
      action: () => onTabChange('inventory'),
      active: activeTab === 'inventory' && pathname === '/admin',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-[#1a1918] font-sans antialiased">
      {/* Collapsible SaaS Left Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1a1918] text-white flex flex-col justify-between transition-all duration-300 border-r border-[#33312e] z-30 shrink-0 select-none shadow-xl`}
      >
        {/* Sidebar Top / Brand Header */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 overflow-hidden cursor-pointer group">
              <div className="w-9 h-9 rounded-full border border-gold flex items-center justify-center bg-black shrink-0 group-hover:scale-105 transition-transform">
                <span className="font-serif text-gold font-bold text-base">LJ</span>
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <span className="font-serif text-sm font-bold tracking-widest text-white block truncate leading-none">
                    LAURE JOYAS
                  </span>
                  <span className="text-[9px] text-gold uppercase font-bold tracking-widest block mt-1">
                    SaaS Management
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title={isSidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-3">
            {navigationItems.map((item) => {
              const isActive = item.active;
              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gold-gradient text-white shadow-md font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-gold-gradient text-white shadow-md font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities Section */}
          {isSidebarOpen && (
            <div className="p-3 mt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold/80 px-3 block">
                Operaciones
              </span>

              {onOpenCashClosureModal && (
                <button
                  onClick={onOpenCashClosureModal}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <ClockIcon className="w-4 h-4 text-gold" />
                  <span>Cierre de Caja Diario</span>
                </button>
              )}

              {onOpenUserManagementModal && user?.role === 'ADMIN' && (
                <button
                  onClick={onOpenUserManagementModal}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-gold" />
                  <span>Gestión de Roles</span>
                </button>
              )}

              <Link
                href="/catalogo"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <CartIcon className="w-4 h-4 text-gold" />
                <span>Ver Tienda Pública</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Status Profile Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold flex items-center justify-center text-gold font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0 flex-grow">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-[10px] text-gold font-mono font-semibold block uppercase">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={logout}
                className="text-gray-400 hover:text-rose-400 text-xs p-1 cursor-pointer transition-colors"
                title="Cerrar Sesión"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* SaaS Top Header Command Bar */}
        <header className="h-16 bg-white border-b border-[#e8e3da] px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
          {/* Left Breadcrumb & Status */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">
              Local: Super Mami N°4 Salsipuedes (Isla 1)
            </span>
            <span className="text-gray-300">|</span>
            {online ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online (Supabase Synced)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <WifiOffIcon className="w-3.5 h-3.5" />
                Offline ({offlinePendingCount} pendientes)
              </span>
            )}
          </div>

          {/* Right Action Trigger Buttons */}
          <div className="flex items-center gap-3">
            {onOpenProductModal && (
              <button
                onClick={onOpenProductModal}
                className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>+ Cargar Producto</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Nuestra Historia', href: '/nosotros' },
    { name: 'Dónde Encontrarnos', href: '/donde-encontrarnos' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#121212] text-white border-b border-[#2a2a2a] shadow-md">
      {/* Top Notification Banner */}
      <div className="bg-[#c5a059] text-black text-xs text-center py-1.5 font-medium tracking-wider uppercase px-4">
        🔥 ¡Aprovechá el <strong>20% OFF en Efectivo / Transferencia</strong>! • Local: Super Mami N°4 Salsipuedes (Isla 1)
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center h-20">
          {/* Column 1: Brand Logo (Left) */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center bg-[#1e1e1e] group-hover:scale-105 transition-transform shrink-0">
                <span className="text-[#c5a059] font-serif text-xl font-bold">LJ</span>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl tracking-widest font-bold block text-white group-hover:text-[#c5a059] transition-colors leading-none">
                  LAURE JOYAS
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest uppercase block mt-1">
                  Joyería & Relojería
                </span>
              </div>
            </Link>
          </div>

          {/* Column 2: Centered Navigation Tabs (Center) */}
          <nav className="hidden md:flex items-center justify-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 px-3 rounded text-xs tracking-wider uppercase font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-[#c5a059] bg-[#1e1e1e] border border-[#333] shadow-sm'
                      : 'text-gray-300 hover:text-[#c5a059] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Column 3: Cart Button, Login & Admin Links (Right) */}
          <div className="flex items-center justify-end gap-2.5">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#333] px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 relative transition-all"
              title="Ver Carrito de Compras"
            >
              <span className="text-base">🛍️</span>
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="bg-[#c5a059] text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Login / User Status */}
            <Link
              href="/login"
              className="text-xs text-gray-300 hover:text-[#c5a059] px-2.5 py-2 rounded bg-[#1e1e1e] border border-[#333] flex items-center gap-1.5"
            >
              <span>👤</span>
              <span className="hidden lg:inline">{user ? user.name.split(' ')[0] : 'Ingresar'}</span>
            </Link>

            {/* Admin Button */}
            <Link
              href="/admin"
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>⚙️</span> <span className="hidden sm:inline">Admin / Stock</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-[#222] py-2.5 text-[11px] uppercase font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                pathname === link.href ? 'text-[#c5a059] font-bold' : 'text-gray-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

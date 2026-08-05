'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { CartIcon, UserIcon, GearIcon, HeartIcon } from '@/components/icons/SvgIcons';

export default function Header() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Nuestra Historia', href: '/nosotros' },
    { name: 'Dónde Encontrarnos', href: '/donde-encontrarnos' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-stitch text-[#1a1918] border-b border-[#e8e3da] shadow-sm select-none">
      {/* Top Notification Banner */}
      <div className="bg-gold-gradient text-white text-[11px] sm:text-xs text-center py-1.5 font-medium tracking-wider uppercase px-4 shadow-inner">
        🔥 ¡Aprovechá el <strong className="font-bold text-white underline decoration-white/50">20% OFF en Efectivo / Transferencia</strong>! • Local: Super Mami N°4 Salsipuedes (Isla 1)
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo (Left) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-full border-2 border-[#c5a059] flex items-center justify-center bg-white shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:border-[#9e7d37] transition-all shrink-0">
                <span className="font-serif text-xl font-bold text-gold">LJ</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-xl sm:text-2xl tracking-widest font-bold block text-[#1a1918] group-hover:text-gold transition-colors leading-none">
                  LAURE JOYAS
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 tracking-widest uppercase block mt-1 font-sans">
                  Joyería &amp; Orfebrería
                </span>
              </div>
            </Link>
          </div>

          {/* Centered Navigation Tabs (Center) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 mx-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 px-4 rounded-full text-xs tracking-wider uppercase font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#1a1918] bg-white border border-[#c5a059]/40 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gold hover:bg-white/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons Container (Right) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            {/* Wishlist Button */}
            <Link
              href="/favoritos"
              className="relative bg-white hover:bg-[#fcfbf9] text-gray-700 hover:text-rose-500 border border-[#e8e3da] hover:border-rose-300 px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Mis Favoritos"
              aria-label={`Mis Favoritos (${wishlistCount} ítems)`}
            >
              <HeartIcon className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="hidden sm:inline transition-colors font-sans">Favoritos</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-white hover:bg-[#fcfbf9] text-gray-800 hover:text-gold border border-[#e8e3da] hover:border-[#c5a059]/50 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Ver Carrito de Compras"
              aria-label={`Ver Carrito de Compras (${itemCount} productos)`}
            >
              <CartIcon className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="hidden sm:inline transition-colors font-sans">Carrito</span>
              {itemCount > 0 && (
                <span className="bg-gold-gradient text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-0.5 shadow">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Login / User Status Button */}
            <Link
              href="/login"
              className="text-xs text-gray-700 hover:text-gold hover:bg-[#fcfbf9] px-4 py-2.5 min-h-[44px] rounded-full bg-white border border-[#e8e3da] hover:border-[#c5a059]/50 flex items-center gap-2 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Iniciar Sesión"
              aria-label="Cuenta de usuario e inicio de sesión"
            >
              <UserIcon className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="hidden md:inline transition-colors font-sans">{mounted && user ? user.name.split(' ')[0] : 'Ingresar'}</span>
            </Link>


            {/* Admin / Stock Button - Visible strictly for authorized ADMIN or EMPLOYEE */}
            {mounted && user && (user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
              <Link
                href="/admin"
                className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
              >
                <GearIcon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Admin / Stock</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-[#e8e3da] py-2.5 text-[11px] uppercase font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cursor-pointer transition-colors py-1 px-3 rounded-full ${
                pathname === link.href ? 'text-gold font-bold bg-white border border-[#e8e3da]' : 'text-gray-600 hover:text-gray-900'
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


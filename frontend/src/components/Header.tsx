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
    <header className="sticky top-0 z-50 bg-[#121212] text-white border-b border-[#2a2a2a] shadow-md select-none">
      {/* Top Notification Banner */}
      <div className="bg-[#c5a059] text-black text-[11px] sm:text-xs text-center py-1.5 font-medium tracking-wider uppercase px-4">
        🔥 ¡Aprovechá el <strong>20% OFF en Efectivo / Transferencia</strong>! • Local: Super Mami N°4 Salsipuedes (Isla 1)
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo (Left) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center bg-[#1e1e1e] group-hover:scale-105 group-hover:bg-[#252525] transition-all shrink-0">
                <span className="text-[#c5a059] font-serif text-xl font-bold">LJ</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-xl sm:text-2xl tracking-widest font-bold block text-white group-hover:text-[#c5a059] transition-colors leading-none">
                  LAURE JOYAS
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest uppercase block mt-1 group-hover:text-gray-300">
                  Joyería &amp; Relojería
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
                  className={`py-2 px-3.5 rounded text-xs tracking-wider uppercase font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#c5a059] bg-[#1e1e1e] border border-[#333] shadow-sm font-bold'
                      : 'text-gray-300 hover:text-[#c5a059] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons Container (Right) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
            {/* Wishlist Button */}
            <Link
              href="/favoritos"
              className="relative bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white hover:text-rose-400 border border-[#333] hover:border-rose-400/50 px-2.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Mis Favoritos"
            >
              <HeartIcon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline transition-colors">Favoritos</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white hover:text-[#c5a059] border border-[#333] hover:border-[#c5a059]/50 px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Ver Carrito de Compras"
            >
              <CartIcon className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline transition-colors">Carrito</span>
              {itemCount > 0 && (
                <span className="bg-[#c5a059] text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-0.5 shadow">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Login / User Status Button */}
            <Link
              href="/login"
              className="text-xs text-gray-300 hover:text-[#c5a059] hover:bg-[#2a2a2a] px-3 py-2 rounded bg-[#1e1e1e] border border-[#333] hover:border-[#c5a059]/50 flex items-center gap-2 transition-all shadow-sm cursor-pointer group active:scale-95"
              title="Iniciar Sesión"
            >
              <UserIcon className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline transition-colors">{mounted && user ? user.name.split(' ')[0] : 'Ingresar'}</span>
            </Link>

            {/* Admin Button */}
            <Link
              href="/admin"
              className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 hover:shadow-md"
            >
              <GearIcon className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Admin / Stock</span>
            </Link>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-[#222] py-2.5 text-[11px] uppercase font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cursor-pointer transition-colors py-1 px-2 rounded ${
                pathname === link.href ? 'text-[#c5a059] font-bold bg-[#1e1e1e]' : 'text-gray-400 hover:text-gray-200'
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

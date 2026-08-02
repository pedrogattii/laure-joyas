'use client';

import Link from 'next/link';
import { BUSINESS_CONFIG } from '@/lib/constants';
import { MapPinIcon } from '@/components/icons/SvgIcons';

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-gray-400 py-10 mt-auto border-t border-[#2a2a2a] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-serif text-white font-bold text-lg mb-2 tracking-wider">LAURE JOYAS</p>
            <p className="text-gray-500 leading-relaxed">
              Joyería &amp; Orfebrería artesanal en Plata 925, Plata y Oro Double, y Oro 18kts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-gray-300 font-bold uppercase tracking-wider text-[11px] mb-3">Navegación</p>
            <nav className="flex flex-col gap-2">
              <Link href="/catalogo" className="text-gray-400 hover:text-[#c5a059] transition-colors">Catálogo Completo</Link>
              <Link href="/nosotros" className="text-gray-400 hover:text-[#c5a059] transition-colors">Nuestra Historia</Link>
              <Link href="/donde-encontrarnos" className="text-gray-400 hover:text-[#c5a059] transition-colors">Dónde Encontrarnos</Link>
              <Link href="/favoritos" className="text-gray-400 hover:text-[#c5a059] transition-colors">Mis Favoritos</Link>
            </nav>
          </div>

          {/* Location */}
          <div>
            <p className="text-gray-300 font-bold uppercase tracking-wider text-[11px] mb-3">Ubicación</p>
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300 font-medium">{BUSINESS_CONFIG.storeAddress}</p>
                <p className="text-gray-500 mt-1">{BUSINESS_CONFIG.storeLocationDetail}</p>
                <p className="text-gray-500 mt-1">{BUSINESS_CONFIG.hours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Laure Joyas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

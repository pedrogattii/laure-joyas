'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const pathname = usePathname();

  if (pathname === '/' && !customItems) return null;

  const pathSegments = pathname.split('/').filter(Boolean);

  const defaultItems: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'catalogo') label = 'Catálogo de Joyas';
      if (segment === 'donde-encontrarnos') label = 'Dónde Encontrarnos';
      if (segment === 'nosotros') label = 'Nuestra Historia';
      if (segment === 'favoritos') label = 'Mis Favoritos';
      if (segment === 'checkout') label = 'Finalizar Compra';
      if (segment === 'admin') label = 'Administración';
      if (segment === 'pos') label = 'Punto de Venta (POS)';
      if (segment === 'login') label = 'Mi Cuenta';
      return { label, href };
    }),
  ];

  const items = customItems || defaultItems;

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 sm:px-0">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-gray-500 font-sans">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-gray-300 select-none">/</span>}
              {isLast || !item.href ? (
                <span className="font-semibold text-[#1a1918] tracking-tight">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gold transition-colors font-medium cursor-pointer"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

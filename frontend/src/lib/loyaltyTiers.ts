'use client';

export interface CustomerTierInfo {
  name: string;
  badge: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  minPurchases: number;
  maxPurchases: number;
  perks: string[];
  nextTierProgress: number; // 0 to 100%
  nextTierRemaining: number;
  nextTierName: string | null;
}

export function getCustomerLoyaltyTier(purchaseCount: number): CustomerTierInfo {
  if (purchaseCount >= 10) {
    return {
      name: 'Diamante & Orfebrería',
      badge: 'VIP Leyenda',
      icon: '💎',
      colorClass: 'text-cyan-700',
      bgClass: 'bg-cyan-50',
      borderClass: 'border-cyan-300',
      minPurchases: 10,
      maxPurchases: Infinity,
      perks: [
        'Atención prioritaria VIP & Orfebrería personalizada',
        '20% OFF permanente en compras en efectivo / transferencia',
        'Envíos a domicilio gratis sin monto mínimo',
        'Acceso exclusivo a preventas de colecciones de oro 18k',
      ],
      nextTierProgress: 100,
      nextTierRemaining: 0,
      nextTierName: null,
    };
  }

  if (purchaseCount >= 5) {
    const progress = Math.min(100, Math.round(((purchaseCount - 5) / 5) * 100));
    return {
      name: 'Oro 18k',
      badge: 'Preferencial Gold',
      icon: '🥇',
      colorClass: 'text-[#c5a059]',
      bgClass: 'bg-amber-50',
      borderClass: 'border-[#c5a059]',
      minPurchases: 5,
      maxPurchases: 9,
      perks: [
        'Estuche de lujo de regalo en cada compra',
        '20% OFF en compras en efectivo / transferencia',
        'Asesoramiento exclusivo para talles y medidas de anillos',
      ],
      nextTierProgress: progress,
      nextTierRemaining: 10 - purchaseCount,
      nextTierName: 'Diamante & Orfebrería',
    };
  }

  const progress = Math.min(100, Math.round((purchaseCount / 5) * 100));
  return {
    name: 'Plata 925',
    badge: 'Nivel Inicial',
    icon: '🥈',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    borderClass: 'border-gray-300',
    minPurchases: 0,
    maxPurchases: 4,
    perks: [
      'Acceso al catálogo completo de Plata 925 y Oro Double',
      '20% OFF en compras en efectivo / transferencia',
      'Garantía escrita de autenticidad de metales preciosos',
    ],
    nextTierProgress: progress,
    nextTierRemaining: 5 - purchaseCount,
    nextTierName: 'Oro 18k',
  };
}

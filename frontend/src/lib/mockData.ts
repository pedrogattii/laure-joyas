// Re-export types from the canonical source for backward compatibility
export type { Category, Material, ProductItem } from './types';
import type { Category, Material, ProductItem } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Anillos', codePrefix: 'AN' },
  { id: 'cat-2', name: 'Aros', codePrefix: 'AR' },
  { id: 'cat-3', name: 'Cadenas', codePrefix: 'CD' },
  { id: 'cat-4', name: 'Dijes', codePrefix: 'DJ' },
  { id: 'cat-5', name: 'Pulseras', codePrefix: 'PU' },
  { id: 'cat-6', name: 'Abridores', codePrefix: 'AB' },
];

export const MATERIALS: Material[] = [
  { id: 'mat-1', name: 'Plata 925', codePrefix: 'PL' },
  { id: 'mat-2', name: 'Plata y Oro Double', codePrefix: 'PO' },
  { id: 'mat-3', name: 'Acero 316L', codePrefix: 'AC' },
  { id: 'mat-4', name: 'Oro 18kts', codePrefix: 'OR' },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    code: 'AN-PO-000001',
    name: 'Anillo Plata 925 con Detalle Oro Double 18k',
    description: 'Anillo artesanal de Plata 925 con lámina de oro double de 18kts. Diseño exclusivo de autor.',
    priceList: 50000,
    priceCash: 40000, // 20% OFF
    category: CATEGORIES[0], // Anillos
    material: MATERIALS[1], // Plata y Oro Double
    image: '/images/ring_silver_gold.png',
    stock: 5,
    inStock: true,
    isFeatured: true,
    isOffer: true,
  },
  {
    id: 'prod-2',
    code: 'CD-PL-000002',
    name: 'Cadena Plata 925 con Dije Sol Elegante',
    description: 'Cadena fina de Plata 925 de 45cm con dije pulido en forma de sol brillante.',
    priceList: 35000,
    priceCash: 28000, // 20% OFF
    category: CATEGORIES[2], // Cadenas
    material: MATERIALS[0], // Plata 925
    image: '/images/chain_silver.png',
    stock: 8,
    inStock: true,
    isFeatured: true,
  },
  {
    id: 'prod-3',
    code: 'AR-OR-000003',
    name: 'Abridores Oro 18kts Bolita N°3',
    description: 'Abridores hipoalergénicos de Oro 18kts macizo para bebé o niña, tuerca a rosca de seguridad.',
    priceList: 70000,
    priceCash: 56000, // 20% OFF
    category: CATEGORIES[5], // Abridores
    material: MATERIALS[3], // Oro 18kts
    stock: 3,
    inStock: true,
    isFeatured: true,
    isOffer: true,
  },
  {
    id: 'prod-4',
    code: 'PU-AC-000004',
    name: 'Pulsera Acero 316L Grumetta',
    description: 'Pulsera de acero quirúrgico inalterable con cierre marinero reforzado.',
    priceList: 25000,
    priceCash: 20000, // 20% OFF
    category: CATEGORIES[4], // Pulseras
    material: MATERIALS[2], // Acero 316
    stock: 12,
    inStock: true,
    isOffer: true,
  },
];

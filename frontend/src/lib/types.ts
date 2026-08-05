// Canonical type definitions for Laure Joyas
// All interfaces are defined here and imported by mockData, contexts, components, and future API layers.

export interface Category {
  id: string;
  name: string;
  codePrefix: string;
}

export interface Material {
  id: string;
  name: string;
  codePrefix: string;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  description: string;
  priceList: number; // Precio lista (tarjeta en 3 cuotas)
  priceCash: number; // Precio contado (20% OFF en efectivo/transferencia)
  category: Category;
  material: Material;
  image?: string;
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  isOffer?: boolean;
}

export type ExpenseCategory = 'PROVEEDOR' | 'SUELDO' | 'ALQUILER' | 'VARIABLE';

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // ISO string
  timestamp: number;
  monthKey: string; // YYYY-MM format (ej: "2026-08")
  storeId?: string;
  receiptUrl?: string;
}

export interface SalesRecord {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  paymentMethod: string;
  totalAmount: number;
  date: string;
  timestamp: number; // Unix ms for sorting and persistence
  channel?: 'POS' | 'ONLINE'; // Físico (Isla) u Online (Web)
  rawDate?: string; // ISO date string e.g. "2026-08-03T12:00:00.000Z"
}

export interface SiteBanner {
  id: string;
  section: string; // 'hero_banner' | 'alliance_banner' | 'promo_banner'
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  active?: boolean;
}

export interface StoreSetting {
  key: string;
  value: string;
}


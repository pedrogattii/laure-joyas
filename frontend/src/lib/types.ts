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

export interface SalesRecord {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  paymentMethod: string;
  totalAmount: number;
  date: string;
  timestamp: number; // Unix ms for sorting and persistence
}

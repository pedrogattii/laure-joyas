// Offline queue for POS sales when WiFi is unavailable at the store.
// Saves pending sales to localStorage and provides sync helpers.

import type { ProductItem, SalesRecord } from '@/lib/types';

const OFFLINE_QUEUE_KEY = 'lj_offline_sales_queue';
const SALES_HISTORY_KEY = 'lj_sales_history';
const INVENTORY_STOCK_KEY = 'lj_inventory_stock';

// --- Offline Queue ---

export function getOfflineQueue(): SalesRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(sale: SalesRecord): void {
  const queue = getOfflineQueue();
  queue.push(sale);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export function getOfflineQueueCount(): number {
  return getOfflineQueue().length;
}

// --- Persistent Sales History ---

export function getSavedSalesHistory(): SalesRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SALES_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSalesHistory(sales: SalesRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SALES_HISTORY_KEY, JSON.stringify(sales));
}

export function addSaleToHistory(sale: SalesRecord): SalesRecord[] {
  const history = getSavedSalesHistory();
  const updated = [sale, ...history];
  saveSalesHistory(updated);
  return updated;
}

// --- Persistent Inventory Stock ---

export function getSavedProducts(defaultProducts: ProductItem[]): ProductItem[] {
  if (typeof window === 'undefined') return defaultProducts;
  try {
    const raw = localStorage.getItem(INVENTORY_STOCK_KEY);
    return raw ? JSON.parse(raw) : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

export function saveProducts(products: ProductItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVENTORY_STOCK_KEY, JSON.stringify(products));
}

// --- Connection check ---

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// --- Itemized Daily Cash Report Generator ---

export function generateDailyCashReport(sales: SalesRecord[]): string {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const methodLabels: Record<string, string> = {
    EFECTIVO: '💵 Efectivo',
    TRANSFERENCIA: '🏦 Transferencia',
    FISERV_CREDITO: '💳 Fiserv Crédito',
    FISERV_DEBITO: '💳 Fiserv Débito',
    MERCADOPAGO: '📱 Mercado Pago',
  };

  // Group sales by payment method with full sales list
  const safeSales = Array.isArray(sales) ? sales : [];
  const byMethod: Record<string, { count: number; total: number; items: SalesRecord[] }> = {};
  let grandTotal = 0;

  for (const sale of safeSales) {
    const methodKey = sale && sale.paymentMethod ? sale.paymentMethod : 'EFECTIVO';
    const amount = sale && typeof sale.totalAmount === 'number' ? sale.totalAmount : Number(sale?.totalAmount || 0);

    if (!byMethod[methodKey]) {
      byMethod[methodKey] = { count: 0, total: 0, items: [] };
    }
    byMethod[methodKey].count += 1;
    byMethod[methodKey].total += amount;
    byMethod[methodKey].items.push(sale);
    grandTotal += amount;
  }

  let report = `📊 *CIERRE DE CAJA — LAURE JOYAS*\n`;
  report += `📅 ${today}\n`;
  report += `📍 Isla 1 — Super Mami N°4 Salsipuedes\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Method breakdown with itemized products
  for (const [method, data] of Object.entries(byMethod)) {
    const label = methodLabels[method] || method;
    report += `${label} (${data.count} venta${data.count > 1 ? 's' : ''} → *$${data.total.toLocaleString('es-AR')}*)\n`;
    for (const item of data.items) {
      report += `   • ${item.quantity}x ${item.productName} (SKU: ${item.productCode}) - $${item.totalAmount.toLocaleString('es-AR')}\n`;
    }
    report += `\n`;
  }

  report += `━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `💰 *TOTAL FACTURADO HOY: $${grandTotal.toLocaleString('es-AR')}*\n`;
  report += `📝 Total de transacciones: ${sales.length}\n`;

  return report;
}

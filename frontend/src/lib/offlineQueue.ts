// Offline queue for POS sales when WiFi is unavailable at the store.
// Saves pending sales to localStorage and provides sync helpers.

import type { SalesRecord } from '@/lib/types';

const OFFLINE_QUEUE_KEY = 'lj_offline_sales_queue';
const SALES_HISTORY_KEY = 'lj_sales_history';

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

// --- Persistent Sales History (localStorage until backend is connected) ---

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
  localStorage.setItem(SALES_HISTORY_KEY, JSON.stringify(sales));
}

export function addSaleToHistory(sale: SalesRecord): SalesRecord[] {
  const history = getSavedSalesHistory();
  const updated = [sale, ...history];
  saveSalesHistory(updated);
  return updated;
}

// --- Connection check ---

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// --- Daily Cash Report Generator ---

export function generateDailyCashReport(sales: SalesRecord[]): string {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group by payment method
  const byMethod: Record<string, { count: number; total: number }> = {};
  let grandTotal = 0;

  for (const sale of sales) {
    if (!byMethod[sale.paymentMethod]) {
      byMethod[sale.paymentMethod] = { count: 0, total: 0 };
    }
    byMethod[sale.paymentMethod].count += 1;
    byMethod[sale.paymentMethod].total += sale.totalAmount;
    grandTotal += sale.totalAmount;
  }

  const methodLabels: Record<string, string> = {
    EFECTIVO: '💵 Efectivo',
    TRANSFERENCIA: '🏦 Transferencia',
    FISERV_CREDITO: '💳 Fiserv Crédito',
    FISERV_DEBITO: '💳 Fiserv Débito',
    MERCADOPAGO: '📱 Mercado Pago',
  };

  let report = `📊 *CIERRE DE CAJA — LAURE JOYAS*\n`;
  report += `📅 ${today}\n`;
  report += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const [method, data] of Object.entries(byMethod)) {
    const label = methodLabels[method] || method;
    report += `${label}\n`;
    report += `   ${data.count} venta${data.count > 1 ? 's' : ''} → $${data.total.toLocaleString('es-AR')}\n\n`;
  }

  report += `━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `💰 *TOTAL DEL DÍA: $${grandTotal.toLocaleString('es-AR')}*\n`;
  report += `📝 Total de transacciones: ${sales.length}\n`;

  return report;
}

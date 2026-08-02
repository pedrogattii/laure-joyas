// Cash Session & 30-Day Closure Log Manager for Laure Joyas
// Handles active cash session, closure history (last 30 days), and 24h reopening limits (max 3 reopens).

import type { SalesRecord } from '@/lib/types';
import { generateDailyCashReport } from '@/lib/offlineQueue';

export interface CashClosureRecord {
  id: string;
  closureNumber: string;
  closedBy: string;
  closedAt: number; // Unix ms
  formattedDate: string;
  totalAmount: number;
  totalTransactions: number;
  byMethod: Record<string, { count: number; total: number }>;
  sales: SalesRecord[];
  status: 'CLOSED' | 'REOPENED';
}

export interface CashSessionState {
  sessionId: string;
  openedAt: number;
  isClosed: boolean;
  closedAt?: number;
  lastClosureId?: string;
  reopenTimestamps: number[]; // Timestamps of reopens performed in last 24h
}

const CASH_SESSION_KEY = 'lj_current_cash_session';
const CLOSURES_HISTORY_KEY = 'lj_cash_closures_history';

// --- Session State Helpers ---

export function getCashSessionState(): CashSessionState {
  if (typeof window === 'undefined') {
    return { sessionId: 'session-init', openedAt: Date.now(), isClosed: false, reopenTimestamps: [] };
  }
  try {
    const raw = localStorage.getItem(CASH_SESSION_KEY);
    if (!raw) {
      const init: CashSessionState = {
        sessionId: `session-${Date.now()}`,
        openedAt: Date.now(),
        isClosed: false,
        reopenTimestamps: [],
      };
      localStorage.setItem(CASH_SESSION_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return { sessionId: 'session-init', openedAt: Date.now(), isClosed: false, reopenTimestamps: [] };
  }
}

export function saveCashSessionState(state: CashSessionState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CASH_SESSION_KEY, JSON.stringify(state));
}

// --- 30-Day Closure History Helpers ---

export function getCashClosureHistory(): CashClosureRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLOSURES_HISTORY_KEY);
    if (!raw) return [];
    const history: CashClosureRecord[] = JSON.parse(raw);
    
    // Purge records older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = history.filter((record) => record.closedAt >= thirtyDaysAgo);
    if (filtered.length !== history.length) {
      localStorage.setItem(CLOSURES_HISTORY_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveCashClosureRecord(record: CashClosureRecord): void {
  const history = getCashClosureHistory();
  const updated = [record, ...history];
  localStorage.setItem(CLOSURES_HISTORY_KEY, JSON.stringify(updated));
}

// --- Active Session Sales Filter ---

export function getActiveSessionSales(allSales: SalesRecord[], closures?: CashClosureRecord[]): SalesRecord[] {
  if (closures && closures.length > 0) {
    const latestClosed = closures.find(c => c.status === 'CLOSED');
    if (latestClosed) {
      const closedAt = typeof latestClosed.closedAt === 'number' ? latestClosed.closedAt : new Date(latestClosed.closedAt).getTime();
      return allSales.filter((s) => s.timestamp > closedAt);
    }
  }
  const session = getCashSessionState();
  if (session.isClosed && session.closedAt) {
    return allSales.filter((s) => s.timestamp > session.closedAt!);
  }
  return allSales;
}

import { registerSupabaseCashClosure } from './supabaseSync';

// --- Perform Cash Closure ---

export async function confirmCashClosure(
  sessionSales: SalesRecord[],
  operatorName: string
): Promise<{ success: boolean; record?: CashClosureRecord; message: string }> {
  if (sessionSales.length === 0) {
    return { success: false, message: 'No hay ventas registradas en esta caja activa para cerrar.' };
  }

  const now = Date.now();
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const byMethod: Record<string, { count: number; total: number }> = {};
  let totalAmount = 0;

  for (const sale of sessionSales) {
    if (!byMethod[sale.paymentMethod]) {
      byMethod[sale.paymentMethod] = { count: 0, total: 0 };
    }
    byMethod[sale.paymentMethod].count += 1;
    byMethod[sale.paymentMethod].total += sale.totalAmount;
    totalAmount += sale.totalAmount;
  }

  const record: CashClosureRecord = {
    id: `closure-${now}`,
    closureNumber: `CIERRE-${dateStr.replace(/\//g, '')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
    closedBy: operatorName,
    closedAt: now,
    formattedDate: new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    totalAmount,
    totalTransactions: sessionSales.length,
    byMethod,
    sales: sessionSales,
    status: 'CLOSED',
  };

  // Save closure record in Supabase
  const success = await registerSupabaseCashClosure(record);
  
  if (!success) {
    return {
      success: false,
      message: 'Hubo un error al guardar el cierre de caja en la nube.',
    };
  }

  // Update current session to CLOSED & open new session timestamp
  const session = getCashSessionState();
  session.isClosed = true;
  session.closedAt = now;
  session.lastClosureId = record.id;
  saveCashSessionState(session);

  return {
    success: true,
    record,
    message: `✓ Caja cerrada exitosamente. $${totalAmount.toLocaleString('es-AR')} facturados.`,
  };
}

// --- Reopen Cash Session (Max 3 times per 24 hours) ---

export function getReopensCountInLast24h(): number {
  const session = getCashSessionState();
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  return session.reopenTimestamps.filter((t) => t >= twentyFourHoursAgo).length;
}

export function reopenCashSession(operatorName: string): { success: boolean; message: string } {
  const session = getCashSessionState();

  if (!session.isClosed) {
    return { success: false, message: 'La caja ya se encuentra abierta actualmente.' };
  }

  const reopens24h = getReopensCountInLast24h();
  if (reopens24h >= 3) {
    return {
      success: false,
      message: '⛔ Límite alcanzado: Se permiten como máximo 3 reaperturas de caja en un lapso de 24 horas.',
    };
  }

  // Record this reopen timestamp
  const now = Date.now();
  const updatedTimestamps = [...session.reopenTimestamps.filter((t) => t >= now - 24 * 60 * 60 * 1000), now];

  session.isClosed = false;
  session.closedAt = undefined;
  session.reopenTimestamps = updatedTimestamps;
  saveCashSessionState(session);

  // Update record status in history if exists
  if (session.lastClosureId) {
    const history = getCashClosureHistory();
    const updatedHistory = history.map((r) =>
      r.id === session.lastClosureId ? { ...r, status: 'REOPENED' as const } : r
    );
    localStorage.setItem(CLOSURES_HISTORY_KEY, JSON.stringify(updatedHistory));
  }

  const remaining = 3 - updatedTimestamps.length;
  return {
    success: true,
    message: `🔓 Caja reabierta por ${operatorName}. Te quedan ${remaining} reaperturas permitidas en las próximas 24hs.`,
  };
}

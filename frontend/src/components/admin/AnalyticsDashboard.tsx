'use client';

import { useState, useMemo } from 'react';
import type { ProductItem, SalesRecord, ExpenseRecord, ExpenseCategory } from '@/lib/types';
import { CashIcon, CreditCardIcon, PlusIcon } from '@/components/icons/SvgIcons';
import ExpenseFormModal from '@/components/admin/ExpenseFormModal';
import MovementReportModal from '@/components/admin/MovementReportModal';
import { useSupabaseExpenses, registerSupabaseExpense, deleteSupabaseExpense } from '@/lib/supabaseSync';
import { useToast } from '@/context/ToastContext';

interface AnalyticsDashboardProps {
  products: ProductItem[];
  salesHistory: SalesRecord[];
}

export default function AnalyticsDashboard({
  products = [],
  salesHistory = [],
}: AnalyticsDashboardProps) {
  const { showToast } = useToast();
  const { expenses, fetchExpenses } = useSupabaseExpenses();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Generate last 12 months list (e.g., "2026-08", "2026-07", ...)
  const availableMonths = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;

      const monthName = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      const capitalizedLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      list.push({ key, label: capitalizedLabel });
    }
    return list;
  }, []);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => availableMonths[0].key);

  const selectedMonthObj = availableMonths.find((m) => m.key === selectedMonthKey) || availableMonths[0];

  // Helper to extract YYYY-MM safely
  const getMonthKeyFromRecord = (timestamp?: number, rawDate?: string, displayDate?: string): string => {
    if (rawDate && rawDate.length >= 7 && rawDate.includes('-')) {
      return rawDate.substring(0, 7);
    }
    if (timestamp && typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0) {
      const d = new Date(timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    if (displayDate && displayDate.length >= 7 && displayDate.includes('-')) {
      return displayDate.substring(0, 7);
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // 1. Filter Sales by Selected Month (First to last day of month)
  const monthSales = useMemo(() => {
    const list = Array.isArray(salesHistory) ? salesHistory : [];
    return list.filter((s) => {
      const monthStr = getMonthKeyFromRecord(s.timestamp, s.rawDate, s.date);
      return monthStr === selectedMonthKey;
    });
  }, [salesHistory, selectedMonthKey]);

  // 2. Filter Expenses by Selected Month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const eMonth = e.monthKey || getMonthKeyFromRecord(e.timestamp, e.date);
      return eMonth === selectedMonthKey;
    });
  }, [expenses, selectedMonthKey]);

  // Calculations
  const totalSalesIncome = monthSales.reduce((acc, s) => acc + (s?.totalAmount || 0), 0);

  const posSalesIncome = monthSales
    .filter((s) => !s.channel || s.channel === 'POS')
    .reduce((acc, s) => acc + (s?.totalAmount || 0), 0);

  const onlineSalesIncome = monthSales
    .filter((s) => s.channel === 'ONLINE')
    .reduce((acc, s) => acc + (s?.totalAmount || 0), 0);

  const totalExpensesAmount = monthExpenses.reduce((acc, e) => acc + (e?.amount || 0), 0);
  const netBalance = totalSalesIncome - totalExpensesAmount;

  // Expenses Breakdown
  const expensesByCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      PROVEEDOR: 0,
      SUELDO: 0,
      ALQUILER: 0,
      VARIABLE: 0,
    };
    monthExpenses.forEach((e) => {
      if (map[e.category] !== undefined) {
        map[e.category] += e.amount || 0;
      }
    });
    return map;
  }, [monthExpenses]);

  // Payment method totals for selected month
  const paymentTotals = {
    EFECTIVO: 0,
    TRANSFERENCIA: 0,
    FISERV_CREDITO: 0,
    FISERV_DEBITO: 0,
    MERCADOPAGO: 0,
  };

  monthSales.forEach((s) => {
    let key = s && s.paymentMethod ? s.paymentMethod : 'EFECTIVO';
    if (key === 'FISERV_TARJETA') key = 'FISERV_CREDITO';
    const amount = s && typeof s.totalAmount === 'number' ? s.totalAmount : Number(s?.totalAmount || 0);

    if (paymentTotals[key as keyof typeof paymentTotals] !== undefined) {
      paymentTotals[key as keyof typeof paymentTotals] += amount;
    } else {
      paymentTotals.EFECTIVO += amount;
    }
  });

  const maxPaymentTotal = Math.max(...Object.values(paymentTotals), 1);

  // Handlers for Expenses
  const handleAddExpense = async (expenseData: Omit<ExpenseRecord, 'id' | 'timestamp'>) => {
    const ok = await registerSupabaseExpense(expenseData);
    if (ok) {
      showToast('Egreso registrado correctamente en Supabase', 'success');
      fetchExpenses();
    } else {
      showToast('Error al registrar egreso', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el gasto "${description}"?`)) return;
    const ok = await deleteSupabaseExpense(expenseId);
    if (ok) {
      showToast('Egreso eliminado correctamente', 'success');
      fetchExpenses();
    } else {
      showToast('Error al eliminar egreso', 'error');
    }
  };

  // Inventory Health
  const safeProducts = Array.isArray(products) ? products : [];
  const normalStockCount = safeProducts.filter((p) => p && p.stock > 3).length;
  const lowStockCount = safeProducts.filter((p) => p && p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = safeProducts.filter((p) => p && p.stock <= 0).length;
  const totalProducts = safeProducts.length || 1;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Month Navigator Header */}
      <div className="bg-[#121212] p-4 sm:p-6 rounded-2xl text-white border border-[#c5a059]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-widest block mb-1">
            Gestión Financiera &amp; Métricas Mensuales
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Período: <span className="text-[#c5a059]">{selectedMonthObj.label}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector 12 meses */}
          <select
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="bg-[#1a1918] border border-gold/60 text-white font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label} ({m.key})
              </option>
            ))}
          </select>

          {/* Registrar Gasto button */}
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span>Cargar Egreso</span>
          </button>

          {/* Descargar Informe button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn-stitch-gold text-white font-bold text-xs uppercase px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Informe / Exportar</span>
          </button>
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos Totales */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e3da] shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Ingresos Totales (Ventas)
          </span>
          <span className="font-numeric text-3xl font-extrabold text-emerald-800 block">
            ${totalSalesIncome.toLocaleString('es-AR')}
          </span>
          {/* Progress Bar for Channel Split */}
          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-2">
            <div className="flex justify-between text-[11px] font-sans font-medium text-gray-600">
              <span>Isla (POS): ${posSalesIncome.toLocaleString('es-AR')}</span>
              <span>Web: ${onlineSalesIncome.toLocaleString('es-AR')}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{
                  width: `${
                    totalSalesIncome > 0 ? Math.round((posSalesIncome / totalSalesIncome) * 100) : 0
                  }%`,
                }}
                title="Ventas POS"
              />
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    totalSalesIncome > 0 ? Math.round((onlineSalesIncome / totalSalesIncome) * 100) : 0
                  }%`,
                }}
                title="Ventas Web"
              />
            </div>
          </div>
        </div>

        {/* Egresos Totales */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e3da] shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Egresos / Gastos del Mes
          </span>
          <span className="font-numeric text-3xl font-extrabold text-rose-700 block">
            ${totalExpensesAmount.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] font-bold text-gray-500 block mt-3 border-t border-gray-100 pt-2 uppercase tracking-wider">
            {monthExpenses.length} gastos registrados en {selectedMonthObj.label}
          </span>
        </div>

        {/* Balance Neto */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e3da] shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Balance Neto del Mes
          </span>
          <span
            className={`font-numeric text-3xl font-extrabold block ${
              netBalance >= 0 ? 'text-[#1a1918]' : 'text-rose-600'
            }`}
          >
            ${netBalance.toLocaleString('es-AR')}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 block mt-3 border-t border-gray-100 pt-2">
            {netBalance >= 0 ? 'Utilidad operativa positiva' : 'Balance en déficit'}
          </span>
        </div>

        {/* Transacciones Totales */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e3da] shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Transacciones Registradas
          </span>
          <span className="font-numeric text-3xl font-extrabold text-gold block">
            {monthSales.length} operaciones
          </span>
          <span className="text-[10px] font-bold text-gray-500 block mt-3 border-t border-gray-100 pt-2 uppercase tracking-wider">
            Promedio: $
            {monthSales.length > 0
              ? Math.round(totalSalesIncome / monthSales.length).toLocaleString('es-AR')
              : 0}{' '}
            / ticket
          </span>
        </div>
      </div>

      {/* Expenses Breakdown Cards */}

      <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">
              Control de Egresos Dueña
            </span>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Gastos Clasificados de {selectedMonthObj.label}
            </h3>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Nuevo Egreso</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-[#fbf9f5] p-4 rounded-xl border border-[#ede7dc]">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Proveedores</span>
            <span className="font-mono font-extrabold text-lg text-gray-900 block">
              ${expensesByCategory.PROVEEDOR.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="bg-[#fbf9f5] p-4 rounded-xl border border-[#ede7dc]">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sueldos</span>
            <span className="font-mono font-extrabold text-lg text-gray-900 block">
              ${expensesByCategory.SUELDO.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="bg-[#fbf9f5] p-4 rounded-xl border border-[#ede7dc]">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Alquiler</span>
            <span className="font-mono font-extrabold text-lg text-gray-900 block">
              ${expensesByCategory.ALQUILER.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="bg-[#fbf9f5] p-4 rounded-xl border border-[#ede7dc]">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Gastos Variables</span>
            <span className="font-mono font-extrabold text-lg text-gray-900 block">
              ${expensesByCategory.VARIABLE.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Expenses List Table */}
        {monthExpenses.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Listado de Comprobantes de Egresos Cargados:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121212] text-white uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-right">Monto ($)</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-[#fcf8f2] transition-colors">
                      <td className="py-2 px-3 font-mono text-gray-500">
                        {e.date ? new Date(e.date).toLocaleDateString('es-AR') : '-'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">{e.description}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                        -${e.amount.toLocaleString('es-AR')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(e.id, e.description)}
                          title="Eliminar gasto"
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Sales by Payment Method */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest block">
                Métricas de Caja
              </span>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Ventas según Medio de Pago ({selectedMonthObj.label})
              </h3>
            </div>
            <span className="text-xs text-gray-400">{monthSales.length} ventas</span>
          </div>

          <div className="space-y-4">
            {/* Efectivo */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <CashIcon className="w-3.5 h-3.5 text-emerald-600 inline" /> Efectivo (20% OFF)
                </span>
                <span className="font-mono font-bold text-gray-900">
                  ${paymentTotals.EFECTIVO.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{
                    width: `${(paymentTotals.EFECTIVO / maxPaymentTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Transferencia */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
                  <CashIcon className="w-3.5 h-3.5 text-teal-600 inline" /> Transferencia / Alias (20% OFF)
                </span>
                <span className="font-mono font-bold text-gray-900">
                  ${paymentTotals.TRANSFERENCIA.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{
                    width: `${(paymentTotals.TRANSFERENCIA / maxPaymentTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Fiserv Crédito */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] inline-block"></span>
                  <CreditCardIcon className="w-3.5 h-3.5 text-[#c5a059] inline" /> Fiserv Crédito (1 a 3 Cuotas)
                </span>
                <span className="font-mono font-bold text-gray-900">
                  ${paymentTotals.FISERV_CREDITO.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#c5a059] h-full transition-all duration-500"
                  style={{
                    width: `${(paymentTotals.FISERV_CREDITO / maxPaymentTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Fiserv Débito */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                  <CreditCardIcon className="w-3.5 h-3.5 text-purple-600 inline" /> Fiserv Débito / Prepaga
                </span>
                <span className="font-mono font-bold text-gray-900">
                  ${paymentTotals.FISERV_DEBITO.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{
                    width: `${(paymentTotals.FISERV_DEBITO / maxPaymentTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Mercado Pago */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Mercado Pago QR
                </span>
                <span className="font-mono font-bold text-gray-900">
                  ${paymentTotals.MERCADOPAGO.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{
                    width: `${(paymentTotals.MERCADOPAGO / maxPaymentTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Inventory Health & Stock Status */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest block">
                Auditoría de Stock
              </span>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Salud del Inventario (Local Salsipuedes)
              </h3>
            </div>
            <span className="text-xs text-gray-400">{products.length} Joyas registradas</span>
          </div>

          {/* Combined Progress Bar */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-700 mb-2 flex justify-between">
              <span>Distribución del Stock</span>
              <span>100% Catálogo</span>
            </div>
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(normalStockCount / totalProducts) * 100}%` }}
                title="Stock Normal"
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${(lowStockCount / totalProducts) * 100}%` }}
                title="Stock Bajo"
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${(outOfStockCount / totalProducts) * 100}%` }}
                title="Agotado"
              />
            </div>
          </div>

          {/* Inventory Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="text-emerald-800 text-xl font-bold font-serif block">
                {normalStockCount}
              </span>
              <span className="text-[10px] font-bold uppercase text-emerald-700 block mt-1">
                Stock Óptimo
              </span>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-amber-800 text-xl font-bold font-serif block">
                {lowStockCount}
              </span>
              <span className="text-[10px] font-bold uppercase text-amber-700 block mt-1">
                Stock Crítico (&lt; 3 un.)
              </span>
            </div>

            <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
              <span className="text-rose-800 text-xl font-bold font-serif block">
                {outOfStockCount}
              </span>
              <span className="text-[10px] font-bold uppercase text-rose-700 block mt-1">
                Agotados (0 un.)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Recent Sales Audit */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-[#fbf9f5] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest block">
              Auditoría de Ventas del Mes
            </span>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Ventas Registradas en {selectedMonthObj.label} ({monthSales.length})
            </h3>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs text-[#c5a059] hover:underline font-bold"
          >
            Ver Informe Completo →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121212] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Producto Vendido</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthSales.length > 0 ? (
                monthSales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fcf8f2] transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{s.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.channel === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.channel || 'POS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{s.productName}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{s.quantity} un.</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          s.paymentMethod === 'EFECTIVO' || s.paymentMethod === 'TRANSFERENCIA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.paymentMethod === 'FISERV_DEBITO'
                            ? 'bg-purple-100 text-purple-800'
                            : s.paymentMethod === 'FISERV_CREDITO' || s.paymentMethod === 'FISERV_TARJETA'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {s.paymentMethod === 'FISERV_CREDITO'
                          ? 'Fiserv Crédito (3 Cuotas)'
                          : s.paymentMethod === 'FISERV_DEBITO'
                          ? 'Fiserv Débito / Prepaga'
                          : s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-900">
                      ${Number(s.totalAmount || 0).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    Aún no se registraron ventas en {selectedMonthObj.label}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <MovementReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedMonthKey={selectedMonthKey}
        monthNameLabel={selectedMonthObj.label}
        sales={salesHistory}
        expenses={expenses}
      />
    </div>
  );
}

'use client';

import type { SalesRecord, ExpenseRecord } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

interface MovementReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonthKey: string;
  monthNameLabel: string;
  sales: SalesRecord[];
  expenses: ExpenseRecord[];
}

export default function MovementReportModal({
  isOpen,
  onClose,
  selectedMonthKey,
  monthNameLabel,
  sales,
  expenses,
}: MovementReportModalProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  // Filter sales and expenses by month
  const monthSales = sales.filter((s) => {
    const sDate = s.date || '';
    const sMonth = sDate.substring(0, 7) || new Date(s.timestamp || 0).toISOString().substring(0, 7);
    return sMonth === selectedMonthKey;
  });

  const monthExpenses = expenses.filter((e) => {
    const eMonth = e.monthKey || e.date?.substring(0, 7) || new Date(e.timestamp || 0).toISOString().substring(0, 7);
    return eMonth === selectedMonthKey;
  });

  // Income calculations
  const totalSalesIncome = monthSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const posSales = monthSales.filter((s) => !s.channel || s.channel === 'POS');
  const onlineSales = monthSales.filter((s) => s.channel === 'ONLINE');

  const posSalesIncome = posSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const onlineSalesIncome = onlineSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  // Expense calculations
  const totalExpensesAmount = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const expensesByCategory = {
    PROVEEDOR: 0,
    SUELDO: 0,
    ALQUILER: 0,
    VARIABLE: 0,
  };

  monthExpenses.forEach((e) => {
    if (expensesByCategory[e.category] !== undefined) {
      expensesByCategory[e.category] += e.amount;
    }
  });

  const netBalance = totalSalesIncome - totalExpensesAmount;

  // WhatsApp text copy
  const handleCopyWhatsAppReport = () => {
    const text = `*INFORME CONSOLIDADO - LAURE JOYAS* 💎\n` +
      `📅 *Período:* ${monthNameLabel} (${selectedMonthKey})\n` +
      `----------------------------------------\n` +
      `💵 *Ingresos Totales:* $${totalSalesIncome.toLocaleString('es-AR')}\n` +
      `   • Isla / Local (POS): $${posSalesIncome.toLocaleString('es-AR')} (${posSales.length} ventas)\n` +
      `   • Web / Online: $${onlineSalesIncome.toLocaleString('es-AR')} (${onlineSales.length} ventas)\n\n` +
      `💸 *Egresos Totales:* $${totalExpensesAmount.toLocaleString('es-AR')}\n` +
      `   • Proveedores: $${expensesByCategory.PROVEEDOR.toLocaleString('es-AR')}\n` +
      `   • Sueldos: $${expensesByCategory.SUELDO.toLocaleString('es-AR')}\n` +
      `   • Alquiler: $${expensesByCategory.ALQUILER.toLocaleString('es-AR')}\n` +
      `   • Variables: $${expensesByCategory.VARIABLE.toLocaleString('es-AR')}\n` +
      `----------------------------------------\n` +
      `📈 *BALANCE NETO:* $${netBalance.toLocaleString('es-AR')}`;

    navigator.clipboard.writeText(text);
    showToast('Informe copiado para WhatsApp', 'success');
  };

  // CSV Export
  const handleDownloadCSV = () => {
    let csv = `Tipo,Fecha,Concepto / Producto,Canal / Categoria,Monto ($)\n`;

    monthSales.forEach((s) => {
      csv += `"INGRESO","${s.date}","${s.productName} (${s.productCode})","${s.channel || 'POS'}","${s.totalAmount}"\n`;
    });

    monthExpenses.forEach((e) => {
      csv += `"EGRESO","${e.date}","${e.description}","${e.category}","${e.amount}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laure_joyas_movimientos_${selectedMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV descargado', 'success');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#121212] border border-[#c5a059]/40 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#2a2a2a] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-wider block">
              Informe General de Movimientos y Balance
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              {monthNameLabel} ({selectedMonthKey})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-grow text-xs print:p-0 print:bg-white print:text-black">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#1a1a1a] p-3.5 rounded-xl border border-emerald-900/60">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Ingresos Totales</span>
              <span className="text-xl font-mono font-extrabold text-emerald-400">
                ${totalSalesIncome.toLocaleString('es-AR')}
              </span>
              <div className="text-[10px] text-gray-400 mt-1">
                <span>Isla: ${posSalesIncome.toLocaleString('es-AR')}</span> • <span>Web: ${onlineSalesIncome.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] p-3.5 rounded-xl border border-rose-900/60">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Egresos Totales</span>
              <span className="text-xl font-mono font-extrabold text-rose-400">
                ${totalExpensesAmount.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">
                {monthExpenses.length} comprobantes cargados
              </span>
            </div>

            <div className="bg-[#1a1a1a] p-3.5 rounded-xl border border-[#c5a059]/60">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Balance Neto</span>
              <span className={`text-xl font-mono font-extrabold ${netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${netBalance.toLocaleString('es-AR')}
              </span>
              <span className="text-[10px] text-[#c5a059] block mt-1">
                Utilidad Limpia del Mes
              </span>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a] space-y-3">
            <h4 className="font-bold text-sm text-[#c5a059] border-b border-[#2a2a2a] pb-2">
              Desglose de Egresos del Mes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#121212] p-2 rounded border border-[#2a2a2a]">
                <span className="text-[10px] text-gray-400 block">Proveedores</span>
                <span className="font-mono font-bold text-white text-xs">${expensesByCategory.PROVEEDOR.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-[#121212] p-2 rounded border border-[#2a2a2a]">
                <span className="text-[10px] text-gray-400 block">Sueldos</span>
                <span className="font-mono font-bold text-white text-xs">${expensesByCategory.SUELDO.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-[#121212] p-2 rounded border border-[#2a2a2a]">
                <span className="text-[10px] text-gray-400 block">Alquiler</span>
                <span className="font-mono font-bold text-white text-xs">${expensesByCategory.ALQUILER.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-[#121212] p-2 rounded border border-[#2a2a2a]">
                <span className="text-[10px] text-gray-400 block">Variables</span>
                <span className="font-mono font-bold text-white text-xs">${expensesByCategory.VARIABLE.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Last Transactions / Expenses Preview */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-300">
              Movimientos Recientes ({monthSales.length} Ventas | {monthExpenses.length} Gastos)
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {monthExpenses.map((e) => (
                <div key={e.id} className="bg-rose-950/30 p-2 rounded border border-rose-900/50 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-rose-300">[EGRESO] {e.category}</span> - <span className="text-gray-300">{e.description}</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">-${e.amount.toLocaleString('es-AR')}</span>
                </div>
              ))}

              {monthSales.slice(0, 10).map((s) => (
                <div key={s.id} className="bg-emerald-950/30 p-2 rounded border border-emerald-900/50 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-300">[VENTA {s.channel || 'POS'}]</span> - <span className="text-gray-300">{s.productName} ({s.productCode})</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">+${s.totalAmount.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="bg-[#1a1a1a] p-4 border-t border-[#2a2a2a] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopyWhatsAppReport}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <span>💬 Copiar para WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-lg border border-gray-700 flex items-center gap-1"
            >
              <span>📥 Descargar CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold text-xs rounded-lg shadow flex items-center gap-1"
            >
              <span>🖨️ Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

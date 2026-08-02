'use client';

import type { ProductItem, SalesRecord } from '@/lib/types';
import { CashIcon, CreditCardIcon } from '@/components/icons/SvgIcons';

interface AnalyticsDashboardProps {
  products: ProductItem[];
  salesHistory: SalesRecord[];
}

export default function AnalyticsDashboard({
  products,
  salesHistory,
}: AnalyticsDashboardProps) {

  // 1. Calculations: Total Income & Expenses
  const totalSalesIncome = salesHistory.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalExpenses = 420000; // Alquiler isla, servicios, insumos
  const netBalance = totalSalesIncome - totalExpenses;

  // 2. Sales by Payment Method
  const paymentTotals = {
    EFECTIVO: 0,
    TRANSFERENCIA: 0,
    FISERV_CREDITO: 0,
    FISERV_DEBITO: 0,
    MERCADOPAGO: 0,
  };

  salesHistory.forEach((s) => {
    let key = s.paymentMethod;
    if (key === 'FISERV_TARJETA') key = 'FISERV_CREDITO';

    if (paymentTotals[key as keyof typeof paymentTotals] !== undefined) {
      paymentTotals[key as keyof typeof paymentTotals] += s.totalAmount;
    } else {
      paymentTotals.EFECTIVO += s.totalAmount;
    }
  });

  const maxPaymentTotal = Math.max(...Object.values(paymentTotals), 1);

  // 3. Inventory Health Status
  const normalStockCount = products.filter((p) => p.stock > 3).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalProducts = products.length || 1;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Ingresos Totales (Ventas)
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
            ${totalSalesIncome.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-1">Registradas en el sistema</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Egresos / Gastos del Mes
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-rose-700 font-mono">
            ${totalExpenses.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Alquiler isla, servicios e insumos</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Balance Neto Estimado
          </span>
          <span
            className={`font-serif text-2xl sm:text-3xl font-extrabold font-mono ${
              netBalance >= 0 ? 'text-gray-900' : 'text-rose-600'
            }`}
          >
            ${netBalance.toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-gray-500 block mt-1">Ingresos menos Egresos</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#e5e0d8] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Total de Transacciones
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#c5a059]">
            {salesHistory.length} ventas
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Local Salsipuedes + Web</span>
        </div>
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
                Ventas según Medio de Pago
              </h3>
            </div>
            <span className="text-xs text-gray-400">Total acumulado</span>
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

            {/* Fiserv Débito / Prepaga */}
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
              Registro de Auditoría
            </span>
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Últimas Ventas Registradas en Caja
            </h3>
          </div>
          <span className="text-xs text-[#c5a059] font-bold">Actualizado al instante</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121212] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Producto Vendido</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesHistory.length > 0 ? (
                salesHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fcf8f2] transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{s.date}</td>
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
                      ${s.totalAmount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    Aún no se registraron ventas en esta sesión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

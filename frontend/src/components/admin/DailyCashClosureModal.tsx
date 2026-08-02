'use client';

import { useState } from 'react';
import type { SalesRecord } from '@/lib/types';
import { generateDailyCashReport } from '@/lib/offlineQueue';
import { BUSINESS_CONFIG } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import { CheckIcon, ShareIcon, WhatsAppIcon } from '@/components/icons/SvgIcons';

interface DailyCashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesHistory: SalesRecord[];
}

export default function DailyCashClosureModal({
  isOpen,
  onClose,
  salesHistory,
}: DailyCashClosureModalProps) {
  const { showToast } = useToast();
  const [isClosed, setIsClosed] = useState(false);

  if (!isOpen) return null;

  const report = generateDailyCashReport(salesHistory);

  // Group by method for visual display
  const byMethod: Record<string, { count: number; total: number }> = {};
  let grandTotal = 0;
  for (const sale of salesHistory) {
    if (!byMethod[sale.paymentMethod]) {
      byMethod[sale.paymentMethod] = { count: 0, total: 0 };
    }
    byMethod[sale.paymentMethod].count += 1;
    byMethod[sale.paymentMethod].total += sale.totalAmount;
    grandTotal += sale.totalAmount;
  }

  const methodLabels: Record<string, { label: string; color: string }> = {
    EFECTIVO: { label: 'Efectivo', color: 'bg-emerald-100 text-emerald-800' },
    TRANSFERENCIA: { label: 'Transferencia', color: 'bg-teal-100 text-teal-800' },
    FISERV_CREDITO: { label: 'Fiserv Crédito', color: 'bg-amber-100 text-amber-800' },
    FISERV_DEBITO: { label: 'Fiserv Débito', color: 'bg-purple-100 text-purple-800' },
    MERCADOPAGO: { label: 'Mercado Pago', color: 'bg-blue-100 text-blue-800' },
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      showToast('Reporte copiado al portapapeles', 'success');
    } catch {
      // Fallback for mobile
      const textArea = document.createElement('textarea');
      textArea.value = report;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Reporte copiado', 'success');
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(report);
    // Use wa.me without number so user can choose the recipient
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCloseCash = () => {
    setIsClosed(true);
    showToast('Caja cerrada exitosamente. Compartí el reporte con la dueña.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212] text-white p-5 rounded-t-xl flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] text-[#c5a059] font-bold uppercase tracking-widest block">
              Cierre de Caja Diario
            </span>
            <h2 className="font-serif text-lg font-bold text-white">
              Resumen del Día
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {salesHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">No hay ventas registradas hoy</p>
            </div>
          ) : (
            <>
              {/* Method Breakdown Cards */}
              <div className="space-y-2">
                {Object.entries(byMethod).map(([method, data]) => {
                  const meta = methodLabels[method] || { label: method, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div
                      key={method}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.count} venta{data.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">
                        ${data.total.toLocaleString('es-AR')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grand Total */}
              <div className="bg-[#121212] text-white p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                    Total del Día
                  </span>
                  <span className="text-2xl font-mono font-bold text-[#c5a059]">
                    ${grandTotal.toLocaleString('es-AR')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {salesHistory.length} transacciones
                </span>
              </div>

              {/* Action Buttons — mobile friendly, large tap targets */}
              <div className="space-y-3 pt-2">
                {!isClosed ? (
                  <button
                    onClick={handleCloseCash}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider py-4 rounded shadow flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckIcon className="w-5 h-5" />
                    <span>Confirmar Cierre de Caja</span>
                  </button>
                ) : (
                  <div className="bg-emerald-100 text-emerald-800 text-center py-3 rounded-lg font-bold text-sm">
                    ✓ Caja cerrada
                  </div>
                )}

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm uppercase py-4 rounded shadow flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Compartir Reporte por WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyReport}
                  className="w-full border-2 border-gray-300 text-gray-700 font-bold text-xs uppercase py-3 rounded flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Copiar Reporte al Portapapeles</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

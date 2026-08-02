'use client';

import { useState } from 'react';
import type { SalesRecord } from '@/lib/types';
import { generateDailyCashReport } from '@/lib/offlineQueue';
import { BUSINESS_CONFIG } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import { CheckIcon, ShareIcon, WhatsAppIcon } from '@/components/icons/SvgIcons';
import {
  confirmCashClosure,
  reopenCashSession,
  getCashSessionState,
  getReopensCountInLast24h,
} from '@/lib/cashClosureManager';
import CashClosureHistoryModal from '@/components/admin/CashClosureHistoryModal';

interface DailyCashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesHistory: SalesRecord[];
  operatorName?: string;
  onSessionStatusChange?: () => void;
}

export default function DailyCashClosureModal({
  isOpen,
  onClose,
  salesHistory,
  operatorName = 'Operario Local',
  onSessionStatusChange,
}: DailyCashClosureModalProps) {
  const { showToast } = useToast();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  if (!isOpen) return null;

  const sessionState = getCashSessionState();
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
    if (BUSINESS_CONFIG.whatsappEnabled) {
      const encoded = encodeURIComponent(report);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } else {
      handleCopyReport();
    }
  };

  const handleConfirmClose = async () => {
    const result = await confirmCashClosure(salesHistory, operatorName);
    if (result.success) {
      showToast(result.message, 'success');
      if (onSessionStatusChange) onSessionStatusChange();
    } else {
      showToast(result.message, 'warning');
    }
  };

  const handleReopenSession = () => {
    const result = reopenCashSession(operatorName);
    if (result.success) {
      showToast(result.message, 'success');
      if (onSessionStatusChange) onSessionStatusChange();
    } else {
      showToast(result.message, 'error');
    }
  };

  const reopensUsed = getReopensCountInLast24h();

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
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
              className="text-gray-400 hover:text-white text-lg font-bold p-1 btn-animate"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4 text-gray-900">
            {/* Top Toolbar: View 30-day History */}
            <div className="flex justify-between items-center bg-[#fbf9f5] p-3 rounded-lg border border-[#e5dfd5]">
              <span className="text-xs text-gray-600 font-medium">Histórico de Cierres:</span>
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-xs font-bold text-[#c5a059] hover:underline flex items-center gap-1 btn-animate"
              >
                📜 Ver últimos 30 días
              </button>
            </div>

            {salesHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-medium">No hay ventas registradas en la caja activa</p>
                {sessionState.isClosed && (
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    ✓ La caja anterior ya fue cerrada. Las próximas ventas abrirán un nuevo registro.
                  </p>
                )}
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
                      Total de Caja Activa
                    </span>
                    <span className="text-2xl font-mono font-bold text-[#c5a059]">
                      ${grandTotal.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {salesHistory.length} transacciones
                  </span>
                </div>

                {/* Session Action Controls */}
                <div className="space-y-3 pt-2">
                  {!sessionState.isClosed ? (
                    <button
                      onClick={handleConfirmClose}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider py-4 rounded shadow flex items-center justify-center gap-2 btn-animate cursor-pointer"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>Confirmar Cierre de Caja</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-center font-bold text-xs">
                        ✓ Caja cerrada por {operatorName}.
                        <p className="text-[10px] font-normal text-emerald-700 mt-0.5">
                          Las próximas ventas iniciarán una nueva caja.
                        </p>
                      </div>

                      {/* Reopen Session Button */}
                      <button
                        onClick={handleReopenSession}
                        disabled={reopensUsed >= 3}
                        className={`w-full py-3 rounded text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-2 btn-animate ${
                          reopensUsed >= 3
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                        }`}
                      >
                        <span>🔓 Reabrir / Restaurar Caja ({reopensUsed}/3 usadas en 24h)</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm uppercase py-4 rounded shadow flex items-center justify-center gap-2 btn-whatsapp cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Compartir Reporte por WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyReport}
                    className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-xs uppercase py-3.5 rounded flex items-center justify-center gap-2 btn-animate cursor-pointer"
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

      {/* 30-Day Closure History Modal */}
      <CashClosureHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </>
  );
}

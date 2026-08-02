'use client';

import { useState } from 'react';
import {
  CashClosureRecord,
} from '@/lib/cashClosureManager';
import { generateDailyCashReport } from '@/lib/offlineQueue';
import { useToast } from '@/context/ToastContext';
import { ShareIcon, WhatsAppIcon, ClockIcon } from '@/components/icons/SvgIcons';
import { BUSINESS_CONFIG } from '@/lib/constants';
import { useSupabaseCashClosures } from '@/lib/supabaseSync';

interface CashClosureHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CashClosureHistoryModal({
  isOpen,
  onClose,
}: CashClosureHistoryModalProps) {
  const { showToast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<CashClosureRecord | null>(null);
  
  const { closures: history, loading } = useSupabaseCashClosures();

  if (!isOpen) return null;

  const handleCopyRecordReport = async (record: CashClosureRecord) => {
    const reportText = generateDailyCashReport(record.sales);
    try {
      await navigator.clipboard.writeText(reportText);
      showToast(`✓ Reporte de ${record.closureNumber} copiado al portapapeles`, 'success');
    } catch {
      showToast('Reporte copiado', 'success');
    }
  };

  const handleShareRecordWhatsApp = (record: CashClosureRecord) => {
    const reportText = generateDailyCashReport(record.sales);
    if (BUSINESS_CONFIG.whatsappEnabled) {
      window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank');
    } else {
      handleCopyRecordReport(record);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-gray-200 relative animate-fadeIn max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#121212] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[#c5a059]" />
              <span className="text-[10px] text-[#c5a059] font-bold uppercase tracking-widest block">
                Historial de Cierres de Caja
              </span>
            </div>
            <h2 className="font-serif text-lg font-bold text-white mt-0.5">
              Registros de los últimos 30 días ({history.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-1 btn-animate"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-grow overflow-y-auto space-y-4 text-gray-900">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-serif font-bold text-gray-700">No hay cierres de caja archivados</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Cada vez que confirmes el cierre de caja del día, la información quedará guardada aquí durante 30 días.
              </p>
            </div>
          ) : selectedRecord ? (
            /* Detailed View of Single Past Closure */
            <div className="space-y-4 animate-fadeIn">
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-bold text-[#c5a059] hover:underline flex items-center gap-1 mb-2"
              >
                ← Volver a la lista de cierres
              </button>

              <div className="bg-[#121212] text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#c5a059]">
                    {selectedRecord.closureNumber}
                  </span>
                  <span className="text-[10px] bg-[#222] text-gray-300 px-2 py-0.5 rounded border border-[#333]">
                    Por: {selectedRecord.closedBy}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{selectedRecord.formattedDate}</p>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#2a2a2a]">
                  <span className="text-xs text-gray-400">Total Facturado:</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    ${selectedRecord.totalAmount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Itemized Sales in this closure */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Detalle de Joyas Vendidas ({selectedRecord.sales.length} transacciones):
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedRecord.sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{sale.productName}</p>
                        <p className="text-[10px] text-gray-500">
                          SKU: {sale.productCode} • {sale.quantity}un. • {sale.paymentMethod}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-emerald-800">
                        ${sale.totalAmount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions for this closure */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleShareRecordWhatsApp(selectedRecord)}
                  className="flex-1 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs uppercase py-3 rounded shadow flex items-center justify-center gap-2 btn-whatsapp cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
                <button
                  onClick={() => handleCopyRecordReport(selectedRecord)}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold text-xs uppercase py-3 rounded flex items-center justify-center gap-2 btn-animate cursor-pointer"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Copiar Reporte</span>
                </button>
              </div>
            </div>
          ) : (
            /* List of past 30 days closures */
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Seleccioná cualquier cierre para ver el detalle de productos vendidos, copiar el informe o reenviarlo por WhatsApp:
              </p>
              {history.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="p-4 rounded-xl border border-gray-200 hover:border-[#c5a059] bg-[#fbf9f5] hover:bg-white transition-all cursor-pointer shadow-sm group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#c5a059]">
                        {record.closureNumber}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                        {record.closedBy}
                      </span>
                      {record.status === 'REOPENED' && (
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                          Reabierto
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-800">{record.formattedDate}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {record.totalTransactions} transacciones registradas
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-mono font-bold text-emerald-800 block">
                      ${record.totalAmount.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] font-bold text-[#c5a059] group-hover:underline">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

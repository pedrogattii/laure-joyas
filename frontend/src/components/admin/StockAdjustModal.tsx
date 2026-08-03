'use client';

import { useState } from 'react';
import type { ProductItem } from '@/lib/types';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onSaveStock: (productId: string, newStock: number) => Promise<void>;
}

export default function StockAdjustModal({
  isOpen,
  onClose,
  product,
  onSaveStock,
}: StockAdjustModalProps) {
  const [stockInput, setStockInput] = useState<string>('0');
  const [prevProductId, setPrevProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setStockInput(String(product.stock));
  }

  if (!isOpen || !product) return null;

  const currentStock = parseInt(stockInput, 10) || 0;

  const handleAdjust = (delta: number) => {
    const next = Math.max(0, currentStock + delta);
    setStockInput(String(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveStock(product.id, Math.max(0, currentStock));
      onClose();
    } catch (err) {
      console.error('Error in StockAdjustModal handleSave:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#121212] border border-[#c5a059]/40 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-wider block">
              Gestión de Inventario
            </span>
            <h3 className="font-serif text-lg font-bold text-white truncate max-w-[280px]">
              {product.name}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#2a2a2a] flex items-center justify-between text-xs">
            <span className="text-gray-400">SKU: <span className="font-mono text-[#c5a059]">{product.code}</span></span>
            <span className="text-gray-400">Stock Actual: <span className="font-bold text-white">{product.stock} un.</span></span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Ingrese o ajuste la nueva cantidad de stock:
            </label>
            
            <div className="flex items-center gap-3 justify-center bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                className="w-10 h-10 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold rounded-lg text-lg flex items-center justify-center transition-all"
              >
                -1
              </button>

              <input
                type="number"
                min="0"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                className="w-28 text-center text-xl font-mono font-bold bg-[#0d0d0d] border border-[#c5a059]/50 text-white rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
              />

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="w-10 h-10 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-bold rounded-lg text-lg flex items-center justify-center transition-all"
              >
                +1
              </button>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-2 text-center">
              Accesos rápidos para sumar o restar:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleAdjust(-5)}
                className="bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-gray-300 text-xs font-bold py-1.5 rounded-lg"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(-10)}
                className="bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-gray-300 text-xs font-bold py-1.5 rounded-lg"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(5)}
                className="bg-[#1a1a1a] hover:bg-[#252525] border border-[#c5a059]/50 text-[#c5a059] text-xs font-bold py-1.5 rounded-lg"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(10)}
                className="bg-[#1a1a1a] hover:bg-[#252525] border border-[#c5a059]/50 text-[#c5a059] text-xs font-bold py-1.5 rounded-lg"
              >
                +10
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold bg-[#c5a059] hover:bg-[#b08d48] text-black rounded-lg shadow-lg uppercase tracking-wider transition-all flex items-center gap-2"
            >
              {isSaving ? 'Guardando...' : 'Guardar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

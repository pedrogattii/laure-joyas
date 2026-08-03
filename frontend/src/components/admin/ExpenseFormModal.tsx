'use client';

import { useState } from 'react';
import type { ExpenseCategory, ExpenseRecord } from '@/lib/types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id' | 'timestamp'>) => Promise<void>;
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onAddExpense,
}: ExpenseFormModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>('VARIABLE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor ingrese un monto válido de egreso');
      return;
    }

    if (!description.trim()) {
      alert('Por favor ingrese una descripción del gasto');
      return;
    }

    setIsSubmitting(true);
    try {
      const monthKey = date.substring(0, 7); // "YYYY-MM"
      await onAddExpense({
        category,
        description: description.trim(),
        amount: numAmount,
        date: new Date(date).toISOString(),
        monthKey,
      });

      // Reset
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().substring(0, 10));
      onClose();
    } catch (err) {
      console.error('Error submitting expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#121212] border border-[#c5a059]/40 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-wider block">
              Gestión Financiera Dueña (Adriana)
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              Registrar Nuevo Egreso / Gasto
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Category */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Categoría de Egreso:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#c5a059] font-semibold"
            >
              <option value="PROVEEDOR">🏬 Proveedores (Mercadería / Insumos)</option>
              <option value="SUELDO">👥 Pagos de Sueldos / Personal</option>
              <option value="ALQUILER">🏠 Pago de Alquiler (Isla / Local)</option>
              <option value="VARIABLE">⚡ Gastos Variables (Servicios, Envío, Impuestos)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Descripción o Concepto:</label>
            <input
              type="text"
              placeholder="Ej: Pago de alquiler Isla Salsipuedes Agosto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Monto en Pesos ($ ARS):</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-mono font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] text-white pl-7 pr-3 py-2 rounded-lg focus:outline-none focus:border-[#c5a059] font-mono font-bold text-sm"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Fecha del Gasto:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg uppercase tracking-wider transition-all"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

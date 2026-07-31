'use client';

import { useState } from 'react';
import { ProductItem } from '@/lib/mockData';
import { CashIcon, CreditCardIcon, CheckIcon } from '@/components/icons/SvgIcons';

interface POSRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSaleSuccess: (saleData: {
    product: ProductItem;
    quantity: number;
    paymentMethod: string;
    totalAmount: number;
  }) => void;
}

export default function POSRegisterModal({
  isOpen,
  onClose,
  products,
  onSaleSuccess,
}: POSRegisterModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('EFECTIVO');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Price calculation according to payment method
  const isCash =
    paymentMethod === 'EFECTIVO' ||
    paymentMethod === 'TRANSFERENCIA' ||
    paymentMethod === 'FISERV_DEBITO';

  const unitPrice = selectedProduct
    ? isCash
      ? selectedProduct.priceCash
      : selectedProduct.priceList
    : 0;

  const totalAmount = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Por favor seleccioná un producto de la lista');
      return;
    }

    if (selectedProduct.stock < quantity) {
      alert(`Stock insuficiente. Stock actual en la isla: ${selectedProduct.stock} unidades.`);
      return;
    }

    onSaleSuccess({
      product: selectedProduct,
      quantity,
      paymentMethod,
      totalAmount,
    });

    onClose();
    // Reset
    setSelectedProductId('');
    setQuantity(1);
    setPaymentMethod('EFECTIVO');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
              Caja Rápida Local Salsipuedes (Isla 1)
            </span>
            <h2 className="font-serif text-xl font-bold text-gray-900 mt-1">
              Registrar Venta Presencial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              1. Seleccionar Producto Vendido *
            </label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none bg-white font-semibold text-gray-900"
            >
              <option value="">-- Buscar joya por nombre o SKU --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                  [{p.code}] {p.name} (Stock: {p.stock} un.) - ${p.priceCash.toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Card Preview */}
          {selectedProduct && (
            <div className="bg-[#fbf9f5] p-3 rounded-lg border border-[#e5dfd5] text-xs space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">{selectedProduct.name}</span>
                <span className="font-mono text-[#c5a059] font-bold">{selectedProduct.code}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Stock disponible en la isla:</span>
                <span className="font-bold text-emerald-700">{selectedProduct.stock} un.</span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              2. Cantidad de Unidades Vendidas *
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct ? selectedProduct.stock : 99}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none font-bold"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
              3. Medio de Pago Elegido por el Cliente *
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`p-2.5 rounded border font-bold text-left transition-all flex items-center gap-2 ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <CashIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Efectivo (20% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-2.5 rounded border font-bold text-left transition-all flex items-center gap-2 ${
                  paymentMethod === 'TRANSFERENCIA'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <CashIcon className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transferencia (20% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('FISERV_CREDITO')}
                className={`p-2.5 rounded border font-bold text-left transition-all flex items-center gap-2 ${
                  paymentMethod === 'FISERV_CREDITO'
                    ? 'border-[#c5a059] bg-[#fcf8f0] text-gray-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>Fiserv Crédito (1 a 3 Cuotas)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('FISERV_DEBITO')}
                className={`p-2.5 rounded border font-bold text-left transition-all flex items-center gap-2 ${
                  paymentMethod === 'FISERV_DEBITO'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCardIcon className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Fiserv Débito / Prepaga</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MERCADOPAGO')}
                className={`p-2.5 rounded border font-bold text-left transition-all col-span-2 flex items-center justify-center gap-2 ${
                  paymentMethod === 'MERCADOPAGO'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>Mercado Pago QR / Transferencia MP</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Notas adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Cliente frecuente, regalo con grabado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none text-xs"
            />
          </div>

          {/* Total Breakdown Card */}
          <div className="bg-[#121212] text-white p-4 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                Total a Cobrar en Caja:
              </span>
              <span className="text-xl font-mono font-bold text-[#c5a059]">
                ${totalAmount.toLocaleString('es-AR')}
              </span>
            </div>
            <span className="text-[11px] text-gray-300 font-medium bg-[#222] px-2.5 py-1 rounded border border-[#333]">
              {isCash ? 'Precio Contado / Débito' : 'Precio Lista (Crédito)'}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 text-gray-700 font-semibold text-xs uppercase px-4 py-2.5 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4 text-white" />
              <span>Confirmar & Descontar Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

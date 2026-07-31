'use client';

import { useState } from 'react';
import { ProductItem } from '@/lib/mockData';

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
  const isCash = paymentMethod === 'EFECTIVO' || paymentMethod === 'TRANSFERENCIA';
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
              🏪 Caja Rápida Local Salsipuedes (Isla 1)
            </span>
            <h2 className="font-serif text-xl font-bold text-gray-900 mt-1">
              Registrar Venta Presencial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
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
                className={`p-3 rounded border font-bold text-left transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                💵 Efectivo (20% OFF)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-3 rounded border font-bold text-left transition-all ${
                  paymentMethod === 'TRANSFERENCIA'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🏦 Transferencia (20% OFF)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('FISERV_TARJETA')}
                className={`p-3 rounded border font-bold text-left transition-all ${
                  paymentMethod === 'FISERV_TARJETA'
                    ? 'border-[#c5a059] bg-[#fcf8f0] text-gray-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Posnet Fiserv (Tarjeta 3 Cuotas)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MERCADOPAGO')}
                className={`p-3 rounded border font-bold text-left transition-all ${
                  paymentMethod === 'MERCADOPAGO'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                📱 Mercado Pago QR
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
              {isCash ? '🔥 Precio Contado (-20%)' : '💳 Precio Lista (Tarjeta)'}
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
              <span>✅</span> Confirmar & Descontar Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

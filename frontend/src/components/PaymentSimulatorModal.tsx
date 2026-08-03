'use client';

import { useState } from 'react';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'MERCADO_PAGO' | 'FISERV';
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  onPaymentSuccess: (paymentDetails: { paymentId: string; method: string; installments: number }) => void;
}

export default function PaymentSimulatorModal({
  isOpen,
  onClose,
  provider,
  totalAmount,
  customerName,
  customerEmail,
  onPaymentSuccess,
}: PaymentSimulatorModalProps) {
  const [testCard, setTestCard] = useState<'APPROVED' | 'DECLINED' | 'INSUFFICIENT_FUNDS'>('APPROVED');
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState('4509 1234 5678 9012');
  const [cardHolder, setCardHolder] = useState(customerName.toUpperCase() || 'CLIENTE TEST');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMP = provider === 'MERCADO_PAGO';

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate 1.5 seconds payment gateway communication
    setTimeout(() => {
      setIsProcessing(false);

      if (testCard === 'DECLINED') {
        setErrorMessage('Pago rechazado por el banco emisor de la tarjeta. Intente con otro medio de pago.');
        return;
      }

      if (testCard === 'INSUFFICIENT_FUNDS') {
        setErrorMessage('Fondos insuficientes en la cuenta. Intente con otra tarjeta.');
        return;
      }

      // Success
      const simulatedPaymentId = `PAY-${provider}-${Math.floor(100000 + Math.random() * 900000)}`;
      onPaymentSuccess({
        paymentId: simulatedPaymentId,
        method: isMP ? 'MERCADO_PAGO' : 'FISERV_CREDITO',
        installments,
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp text-gray-900">
        {/* Header Branding */}
        <div className={`p-4 text-white flex items-center justify-between ${isMP ? 'bg-[#009EE3]' : 'bg-[#121212]'}`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">
              {isMP ? '🔷 Mercado Pago (Pasarela de Prueba / Sandbox)' : '💳 Fiserv / POSNET (Pasarela de Prueba)'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
          <span className="text-sm">🧪</span>
          <div>
            <strong>MODO SIMULADOR DE PASARELA (SANDBOX)</strong>
            <p className="mt-0.5">Podés testear el flujo completo de cobro de prueba sin ingresar datos reales ni credenciales legales aún.</p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-500 block text-[10px]">Cliente:</span>
            <span className="font-bold text-gray-800">{customerName || 'Cliente'} ({customerEmail || 'test@laurejoyas.com'})</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 block text-[10px]">Total a Cobrar:</span>
            <span className="font-mono font-extrabold text-base text-[#c5a059]">
              ${totalAmount.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleProcessPayment} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold animate-fadeIn">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Test Card Scenario Selector */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Resultado de Tarjeta de Prueba (Sandbox Scenario):</label>
            <select
              value={testCard}
              onChange={(e) => setTestCard(e.target.value as 'APPROVED' | 'DECLINED' | 'INSUFFICIENT_FUNDS')}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
            >
              <option value="APPROVED">🟢 Tarjeta Aprobada (Simular Compra Exitosa)</option>
              <option value="DECLINED">🔴 Tarjeta Rechazada (Simular Error de Tarjeta)</option>
              <option value="INSUFFICIENT_FUNDS">⚠️ Fondos Insuficientes (Simular Rechazo)</option>
            </select>
          </div>

          {/* Installments */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Plan de Cuotas:</label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
            >
              <option value={1}>1 Cuota de ${totalAmount.toLocaleString('es-AR')} (Sin interés)</option>
              <option value={2}>2 Cuotas de ${(totalAmount / 2).toLocaleString('es-AR')} (Sin interés)</option>
              <option value={3}>3 Cuotas de ${(totalAmount / 3).toLocaleString('es-AR')} (Sin interés)</option>
            </select>
          </div>

          {/* Dummy Card Input */}
          <div className="space-y-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Número de Tarjeta de Prueba</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 font-mono font-bold text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Vencimiento</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 font-mono text-center font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">CVV / CVC</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 font-mono text-center font-bold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Titular de la Tarjeta</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 uppercase font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-5 py-2 text-xs font-extrabold text-white rounded-lg shadow-md uppercase tracking-wider flex items-center gap-2 ${
                isMP ? 'bg-[#009EE3] hover:bg-[#0086C2]' : 'bg-[#121212] hover:bg-black text-[#c5a059]'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Procesando Cobro de Prueba...</span>
                </>
              ) : (
                <span>Confirmar Pago (${totalAmount.toLocaleString('es-AR')})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

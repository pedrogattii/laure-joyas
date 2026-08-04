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
  const [selectedMethodTab, setSelectedMethodTab] = useState<'card' | 'mp_balance' | 'qr'>('card');
  const [testCard, setTestCard] = useState<'APPROVED' | 'DECLINED' | 'INSUFFICIENT_FUNDS'>('APPROVED');
  const [installments, setInstallments] = useState(1);
  
  const [cardNumber, setCardNumber] = useState('4509 9500 0000 0000');
  const [cardHolder, setCardHolder] = useState(customerName.toUpperCase() || 'APRO C');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('123');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [generatedPaymentId, setGeneratedPaymentId] = useState('');

  if (!isOpen) return null;

  const isMP = provider === 'MERCADO_PAGO';

  const selectTestCardType = (type: 'APPROVED' | 'DECLINED' | 'INSUFFICIENT_FUNDS') => {
    setTestCard(type);
    setErrorMessage(null);
    if (type === 'APPROVED') {
      setCardNumber('4509 9500 0000 0000');
      setCardHolder('APRO C');
    } else if (type === 'INSUFFICIENT_FUNDS') {
      setCardNumber('4509 9500 0000 0001');
      setCardHolder('SIN SALDO');
    } else {
      setCardNumber('4509 9500 0000 0002');
      setCardHolder('RECHAZO CVV');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate official 1.8 seconds gateway roundtrip
    setTimeout(() => {
      setIsProcessing(false);

      if (testCard === 'DECLINED') {
        setErrorMessage('El banco rechazó la operación (Código: 2005 - CVV inválido).');
        return;
      }

      if (testCard === 'INSUFFICIENT_FUNDS') {
        setErrorMessage('La tarjeta no tiene fondos suficientes para completar el pago.');
        return;
      }

      // Success
      const simulatedPaymentId = `MP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setGeneratedPaymentId(simulatedPaymentId);
      setIsSuccessScreen(true);

      setTimeout(() => {
        onPaymentSuccess({
          paymentId: simulatedPaymentId,
          method: selectedMethodTab === 'mp_balance' ? 'MERCADO_PAGO_DINERO_EN_CUENTA' : isMP ? 'MERCADO_PAGO_TARJETA' : 'FISERV_CREDITO',
          installments: selectedMethodTab === 'mp_balance' ? 1 : installments,
        });
      }, 2000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp text-gray-900 font-sans">
        
        {/* OFFICIAL MERCADO PAGO HEADER */}
        {isMP ? (
          <div className="bg-[#009ee3] text-white p-4 sm:p-5 relative shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Handshake Logo */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight">mercado pago</span>
                    <span className="bg-white/20 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider">
                      Checkout Pro
                    </span>
                  </div>
                  <span className="text-[11px] text-white/90 font-medium block">
                    🔒 Pago 100% Protegido con SSL de Mercado Pago
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Order total header */}
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-white/80 uppercase font-bold tracking-wider block">Pagar a Laure Joyas</span>
                <span className="text-xs font-semibold text-white/90">Pedido Web ({customerEmail || 'cliente@laurejoyas.com'})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/80 uppercase font-bold block">Total:</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* FISERV HEADER */
          <div className="bg-[#121212] text-white p-4 flex items-center justify-between border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">💳 Fiserv / POSNET Direct (Checkout Sandbox)</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {isSuccessScreen ? (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">¡Listo! Se acreditó tu pago</h3>
              <p className="text-xs text-gray-500 font-mono">Comprobante MP N° {generatedPaymentId}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-left space-y-1.5 text-xs text-emerald-900">
              <div className="flex justify-between font-bold">
                <span>Vendedor:</span>
                <span>Laure Joyas (Salsipuedes)</span>
              </div>
              <div className="flex justify-between font-mono font-bold">
                <span>Monto Acreditado:</span>
                <span>${totalAmount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700">
                <span>Medio de Pago:</span>
                <span>Mercado Pago Checkout Pro</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-semibold animate-pulse">
              Redirigiendo a la confirmación del pedido...
            </p>
          </div>
        ) : (
          /* MAIN FORM CONTENT */
          <div className="p-5 sm:p-6 space-y-5">
            {/* Payment Method Selector Tabs */}
            {isMP && (
              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-xl text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSelectedMethodTab('card')}
                  className={`py-2 px-1 rounded-lg transition-all cursor-pointer ${
                    selectedMethodTab === 'card'
                      ? 'bg-white text-[#009ee3] shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💳 Tarjeta de Crédito / Débito
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethodTab('mp_balance')}
                  className={`py-2 px-1 rounded-lg transition-all cursor-pointer ${
                    selectedMethodTab === 'mp_balance'
                      ? 'bg-white text-[#009ee3] shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💙 Dinero en Cuenta MP
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethodTab('qr')}
                  className={`py-2 px-1 rounded-lg transition-all cursor-pointer ${
                    selectedMethodTab === 'qr'
                      ? 'bg-white text-[#009ee3] shadow-sm font-extrabold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 QR / Rapipago
                </button>
              </div>
            )}

            {/* TAB 1: TARJETA DE CRÉDITO O DÉBITO */}
            {selectedMethodTab === 'card' && (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Selector de Tarjeta de Prueba de Mercado Pago */}
                <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-sky-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>🧪</span> Tarjetas de Prueba de Mercado Pago:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectTestCardType('APPROVED')}
                      className={`py-1.5 px-2 rounded font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        testCard === 'APPROVED'
                          ? 'bg-[#009ee3] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      ✓ Aprobada
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTestCardType('INSUFFICIENT_FUNDS')}
                      className={`py-1.5 px-2 rounded font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        testCard === 'INSUFFICIENT_FUNDS'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      Sin Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTestCardType('DECLINED')}
                      className={`py-1.5 px-2 rounded font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        testCard === 'DECLINED'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      Rechazada
                    </button>
                  </div>
                </div>

                {/* Card Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Nombre y Apellido del Titular
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:outline-none uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm text-center font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        Código CVV
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm text-center font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Installment Selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Plan de Cuotas (Mercado Pago / Visa)
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009ee3] focus:outline-none bg-white"
                    >
                      <option value={1}>1 cuota de ${totalAmount.toLocaleString('es-AR')} (Sin interés)</option>
                      <option value={3}>3 cuotas de ${(totalAmount / 3).toLocaleString('es-AR', { maximumFractionDigits: 0 })} (Sin interés)</option>
                      <option value={6}>6 cuotas de ${(totalAmount / 6).toLocaleString('es-AR', { maximumFractionDigits: 0 })} (Sin interés)</option>
                      <option value={12}>12 cuotas de ${(totalAmount / 12).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</option>
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold animate-fadeIn">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Submit button with Mercado Pago Blue */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#009ee3] hover:bg-[#008ac7] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Procesando pago con Mercado Pago...</span>
                    </span>
                  ) : (
                    <span>Pagar con Mercado Pago • ${totalAmount.toLocaleString('es-AR')}</span>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: DINERO EN CUENTA MERCADO PAGO */}
            {selectedMethodTab === 'mp_balance' && (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-sky-900">
                    <span className="flex items-center gap-2 text-sm">
                      <span>💙</span> Saldo disponible en tu cuenta de Mercado Pago
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-sky-200">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block">Cuenta MP:</span>
                      <span className="font-bold text-gray-800">{customerEmail || 'cliente@laurejoyas.com'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-bold block">Saldo Disponible:</span>
                      <span className="font-extrabold text-emerald-700 font-mono">$250.000,00</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#009ee3] hover:bg-[#008ac7] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? 'Debitando de tu cuenta MP...' : `Pagar $${totalAmount.toLocaleString('es-AR')} con mi Saldo MP`}
                </button>
              </form>
            )}

            {/* TAB 3: QR MERCADO PAGO / EFECTIVO */}
            {selectedMethodTab === 'qr' && (
              <form onSubmit={handleProcessPayment} className="space-y-4 text-center">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <span className="text-xs font-bold text-gray-700 block">Escaneá el QR desde la App de Mercado Pago</span>
                  <div className="w-40 h-40 bg-white p-2 border-2 border-[#009ee3] rounded-xl mx-auto flex items-center justify-center shadow-md">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-mono p-2">
                      <span className="text-2xl mb-1">📱</span>
                      <span>QR MERCADO PAGO</span>
                      <span className="text-[8px] text-sky-400 mt-1">MP-TEST-{totalAmount}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">También podés abonar en Rapipago o Pago Fácil con tu DNI.</p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#009ee3] hover:bg-[#008ac7] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {isProcessing ? 'Confirmando acreditación...' : 'Simular Lectura de QR Aprobada'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

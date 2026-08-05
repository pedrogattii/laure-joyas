'use client';

import React, { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

export type MPFormData = Record<string, unknown>;

interface MercadoPagoBrickProps {
  amount: number;
  payerEmail: string;
  payerDni: string;
  onSubmitPayment: (formData: MPFormData) => Promise<void>;
}

export default function MercadoPagoBrick({
  amount,
  payerEmail,
  payerDni,
  onSubmitPayment,
}: MercadoPagoBrickProps) {
  useEffect(() => {
    if (publicKey) {
      try {
        initMercadoPago(publicKey, { locale: 'es-AR' });
      } catch (e) {
        console.warn('Mercado Pago SDK Init Notice:', e);
      }
    }
  }, []);

  if (!publicKey) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 font-sans">
        <p className="font-bold mb-1">Configuración pendiente</p>
        <p>
          No se encontró <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_MP_PUBLIC_KEY</code> en tu archivo <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code>.
        </p>
      </div>
    );
  }

  if (!amount || amount <= 0) {
    return (
      <div className="p-4 text-center text-xs text-gray-500 font-sans">
        El monto a pagar debe ser mayor a $0 para cargar el formulario de tarjeta.
      </div>
    );
  }

  const initialization = {
    amount: Number(amount),
    payer: {
      email: payerEmail || 'test_user_328222467@testuser.com',
      identification: {
        type: 'DNI',
        number: payerDni || '12345678',
      },
    },
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
      maxInstallments: 12,
    },
    visual: {
      style: {
        theme: 'default' as const,
      },
    },
  };

  const handleSubmit = async (
    param: Parameters<NonNullable<React.ComponentProps<typeof Payment>['onSubmit']>>[0]
  ) => {
    try {
      await onSubmitPayment(param.formData as unknown as MPFormData);
    } catch (error) {
      console.warn('Error al procesar el envío del pago:', error);
      throw error;
    }
  };

  const handleError = async (error: unknown) => {
    // Usamos console.warn para evitar que Next.js dev overlay capture objetos de error vacíos del SDK
    console.warn('Mercado Pago Brick Callback Notice:', error);
  };

  return (
    <div id="paymentBrick_container" className="w-full bg-white rounded-xl p-2 shadow-sm border border-[#e8e3da]">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={handleSubmit}
        onReady={() => console.log('Mercado Pago Brick listo')}
        onError={handleError}
      />
    </div>
  );
}

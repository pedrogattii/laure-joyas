'use client';

import React from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

if (typeof window !== 'undefined' && publicKey) {
  try {
    initMercadoPago(publicKey, { locale: 'es-AR' });
  } catch (e) {
    console.error('Error inicializando Mercado Pago SDK:', e);
  }
}

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

  const initialization = {
    amount: amount,
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
      console.error('Error al enviar el pago:', error);
      throw error;
    }
  };

  const handleError = async (error: unknown) => {
    console.error('Mercado Pago Brick error:', error);
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

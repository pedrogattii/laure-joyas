'use client';

import React, { useEffect } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

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
      maxInstallments: 12,
    },
    visual: {
      style: {
        theme: 'default' as const,
      },
    },
  };

  const handleSubmit = async (
    param: Parameters<NonNullable<React.ComponentProps<typeof CardPayment>['onSubmit']>>[0]
  ) => {
    try {
      await onSubmitPayment(param as unknown as MPFormData);
    } catch (error) {
      console.warn('Error al procesar el envío del pago:', error);
      throw error;
    }
  };

  const handleError = async (error: unknown) => {
    console.warn('Mercado Pago CardPayment Brick Notice:', error);
  };

  return (
    <div id="cardPaymentBrick_container" className="w-full bg-white rounded-xl p-2 shadow-sm border border-[#e8e3da]">
      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={handleSubmit}
        onReady={() => console.log('Mercado Pago CardPayment Brick listo')}
        onError={handleError}
      />
    </div>
  );
}

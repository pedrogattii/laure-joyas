import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { formData, transaction_amount, description } = body;

    if (!formData || !formData.token) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos de la tarjeta (token).' },
        { status: 400 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });

    const payment = new Payment(client);

    const paymentData = {
      body: {
        transaction_amount: Number(transaction_amount),
        token: formData.token,
        description: description || 'Compra en Laure Joyas',
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : undefined,
        installments: Number(formData.installments || 1),
        payer: {
          email: formData.payer?.email,
          identification: formData.payer?.identification?.number
            ? {
                type: formData.payer.identification.type || 'DNI',
                number: String(formData.payer.identification.number),
              }
            : undefined,
        },
      },
    };

    const response = await payment.create(paymentData);

    return NextResponse.json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      payment_method_id: response.payment_method_id,
      payment_type_id: response.payment_type_id,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno al procesar el pago con Mercado Pago';
    console.error('Error al procesar pago con Mercado Pago:', error);
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.cause : error,
      },
      { status: 500 }
    );
  }
}

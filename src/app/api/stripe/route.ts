import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      
      mode: 'payment',
      
      line_items: [
        {
          price_data: {
            currency: 'pen',

            product_data: {
              name: `Pedido #${body.pedidoId}`,
            },

            unit_amount: body.monto * 100,
          },

          quantity: 1,
        },
      ],

      success_url: 'http://localhost:3000/pago-exitoso',

      cancel_url: 'http://localhost:3000/pago-cancelado',
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Error creando sesión Stripe' },
      { status: 500 }
    );
  }
}
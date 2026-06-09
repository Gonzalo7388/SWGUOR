export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  buildCheckoutConfirmacionUrl,
  CODIGO_CHECKOUT_COMPLETADO,
  MENSAJE_CHECKOUT_COMPLETADO,
} from '@/lib/constants/culqi-checkout';
import { appendDatosPagadorEnNotas } from '@/lib/helpers/datos-pagador-pago.helper';
import { mapStripeIntentRouteError } from '@/lib/helpers/stripe-intent-route.helper';
import { stripeConfirmRequestSchema } from '@/lib/schemas/stripe-confirm';
import { ejecutarCierreVentaPostCulqi } from '@/lib/services/cierre-venta-culqi.service';
import { validarIdempotenciaPagoPedido } from '@/lib/services/pago-idempotencia.service';
import { createPaymentGateway } from '@/lib/services/payments/payment-gateway.factory';

/**
 * POST /api/pagos/stripe/confirm
 *
 * Confirma un PaymentIntent ya validado en el cliente y ejecuta el cierre de venta.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = stripeConfirmRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstIssue?.message ?? 'Datos inválidos',
          code: 'DATOS_INCOMPLETOS',
        },
        { status: 400 },
      );
    }

    const { pedido_id, email, payment_intent_id, monto_a_pagar, description, pagador } =
      parsed.data;

    await validarIdempotenciaPagoPedido(pedido_id);

    const gateway = createPaymentGateway('stripe');
    const metadata = { pedido_id, email, description };

    const intencion = await gateway.crearIntencionPago(
      monto_a_pagar ?? 0,
      'PEN',
      metadata,
    );

    const cargo = await gateway.procesarCargo(
      payment_intent_id,
      intencion.monto,
      intencion.moneda,
      metadata,
    );

    if (!cargo.success) {
      return NextResponse.json(
        {
          success: false,
          message: cargo.message,
          code: cargo.code ?? 'STRIPE_CONFIRM_FAILED',
        },
        { status: cargo.httpStatus },
      );
    }

    const cierre = await ejecutarCierreVentaPostCulqi({
      pedidoId: pedido_id,
      monto: cargo.monto.amountSoles,
      metodoPago: cargo.metodoPago,
      culqiChargeId: cargo.transactionId,
      estadoPago: cargo.estadoPago,
      notas: appendDatosPagadorEnNotas(
        `Pago automático Stripe | payment_intent=${cargo.transactionId}`,
        pagador,
      ),
    });

    const montoPagado = Number(cierre.pedido.monto_pagado ?? 0);
    const saldoPendiente = Number(cierre.pedido.saldo_pendiente ?? 0);
    const pagoCompleto = saldoPendiente <= 0;

    return NextResponse.json({
      success: true,
      message: pagoCompleto
        ? MENSAJE_CHECKOUT_COMPLETADO
        : 'Pago parcial registrado correctamente',
      code: CODIGO_CHECKOUT_COMPLETADO,
      data: {
        pedido_id,
        pago_id: cierre.pago.id_uuid,
        comprobante_id: cierre.comprobante.id_uuid,
        numero_comprobante: cierre.comprobante.numero_completo,
        pedido_estado: cierre.pedido.estado,
        stripe_payment_intent_id: cargo.transactionId,
        redirect_url: buildCheckoutConfirmacionUrl(
          pedido_id,
          cierre.comprobante.id_uuid,
        ),
        monto_cobrado: cargo.monto.amountSoles,
        monto_pagado: montoPagado,
        saldo_pendiente: saldoPendiente,
        pago_completo: pagoCompleto,
      },
    });
  } catch (error) {
    return mapStripeIntentRouteError(error);
  }
}

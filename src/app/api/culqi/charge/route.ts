export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  buildCheckoutConfirmacionUrl,
  CODIGO_CHECKOUT_COMPLETADO,
  MENSAJE_CHECKOUT_COMPLETADO,
} from '@/lib/constants/culqi-checkout';
import {
  jsonCheckoutError,
  mapCheckoutRouteError,
} from '@/lib/helpers/culqi-checkout-route.helper';
import {
  culqiCheckoutRequestSchema,
  type CulqiCheckoutSuccessResponse,
} from '@/lib/schemas/culqi-checkout';
import { ejecutarCierreVentaPostCulqi } from '@/lib/services/cierre-venta-culqi.service';
import { validarIdempotenciaPagoPedido } from '@/lib/services/pago-idempotencia.service';
import type { IPaymentGateway } from '@/lib/services/payments/ipayment-gateway';
import { createPaymentGateway } from '@/lib/services/payments/payment-gateway.factory';

/**
 * POST /api/culqi/charge
 *
 * Flujo de pago parcial / adelanto:
 * 1. Validar payload (pedido_id, token/source_id, monto_a_pagar opcional)
 * 2. Idempotencia — pedido con saldo pendiente > 0
 * 3. Validar monto_a_pagar contra saldo_pendiente en BD (máx. saldo, mín. S/ 10)
 * 4. Cargo Culqi (monto × 100 céntimos)
 * 5. Transacción atómica: pagos + pedidos + comprobante
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = culqiCheckoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return jsonCheckoutError(
        {
          success: false,
          message: firstIssue?.message ?? 'Datos de checkout inválidos',
          code: 'DATOS_INCOMPLETOS',
        },
        400,
      );
    }

    const { pedido_id, email, token, source_id, description, monto_a_pagar } = parsed.data;

    // 1) El pedido debe existir y tener saldo pendiente
    await validarIdempotenciaPagoPedido(pedido_id);

    const gateway: IPaymentGateway = createPaymentGateway('culqi');
    const metadata = { pedido_id, email, description };

    // 2) Intención de pago — valida monto contra saldo en BD
    const intencion = await gateway.crearIntencionPago(
      monto_a_pagar ?? 0,
      'PEN',
      metadata,
    );

    // 3) Cargo en pasarela (monto re-validado contra BD)
    const cargo = await gateway.procesarCargo(
      source_id ?? token ?? '',
      intencion.monto,
      intencion.moneda,
      metadata,
    );

    if (!cargo.success) {
      return jsonCheckoutError(
        {
          success: false,
          message: cargo.message,
          code: cargo.code ?? 'CULQI_CHARGE_FAILED',
        },
        cargo.httpStatus,
      );
    }

    // 4) Cierre atómico post-pasarela: pagos + actualización pedidos + comprobante
    const cierre = await ejecutarCierreVentaPostCulqi({
      pedidoId: pedido_id,
      monto: cargo.monto.amountSoles,
      metodoPago: cargo.metodoPago,
      culqiChargeId: cargo.transactionId,
    });

    const montoPagado = Number(cierre.pedido.monto_pagado ?? 0);
    const saldoPendiente = Number(cierre.pedido.saldo_pendiente ?? 0);
    const pagoCompleto = saldoPendiente <= 0;

    const successPayload: CulqiCheckoutSuccessResponse = {
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
        culqi_charge_id: cargo.transactionId,
        redirect_url: buildCheckoutConfirmacionUrl(
          pedido_id,
          cierre.comprobante.id_uuid,
        ),
        monto_cobrado: cargo.monto.amountSoles,
        monto_pagado: montoPagado,
        saldo_pendiente: saldoPendiente,
        pago_completo: pagoCompleto,
      },
    };

    return NextResponse.json(successPayload, { status: 200 });
  } catch (error) {
    return mapCheckoutRouteError(error);
  }
}

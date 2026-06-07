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
import { ejecutarCargoCulqiPedido } from '@/lib/services/culqi-charge.service';
import { validarIdempotenciaPagoPedido } from '@/lib/services/pago-idempotencia.service';

/**
 * Orquestador del checkout Culqi:
 * 1) Idempotencia → 2) Cargo Culqi → 3) Cierre atómico BD → 4) JSON con comprobante_id
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

    const { pedido_id, email, token, source_id, description } = parsed.data;

    // 1) Idempotencia — bloquea cobros duplicados antes de llamar a Culqi
    await validarIdempotenciaPagoPedido(pedido_id);

    // 2) Cargo Culqi — monto desde BD, token/source_id del frontend
    const cargo = await ejecutarCargoCulqiPedido({
      pedidoId: pedido_id,
      token,
      sourceId: source_id,
      email,
      description,
    });

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

    // 3) Cierre atómico — pago + pedido + comprobante simulado
    const cierre = await ejecutarCierreVentaPostCulqi({
      pedidoId: pedido_id,
      monto: cargo.monto.amountSoles,
      metodoPago: cargo.metodoPago,
      culqiChargeId: cargo.culqiChargeId,
    });

    // 4) Respuesta de éxito con comprobante_id para redirección en frontend
    const successPayload: CulqiCheckoutSuccessResponse = {
      success: true,
      message: MENSAJE_CHECKOUT_COMPLETADO,
      code: CODIGO_CHECKOUT_COMPLETADO,
      data: {
        pedido_id,
        pago_id: cierre.pago.id_uuid,
        comprobante_id: cierre.comprobante.id_uuid,
        numero_comprobante: cierre.comprobante.numero_completo,
        pedido_estado: cierre.pedido.estado,
        culqi_charge_id: cargo.culqiChargeId,
        redirect_url: buildCheckoutConfirmacionUrl(
          pedido_id,
          cierre.comprobante.id_uuid,
        ),
      },
    };

    return NextResponse.json(successPayload, { status: 200 });
  } catch (error) {
    return mapCheckoutRouteError(error);
  }
}

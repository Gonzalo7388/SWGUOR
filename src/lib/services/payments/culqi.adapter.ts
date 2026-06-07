import {
  CULQI_CHARGES_ENDPOINT,
  CULQI_DEFAULT_CURRENCY,
  getCulqiClientConfig,
  getCulqiSecretKey,
  type CulqiCurrencyCode,
} from '@/lib/constants/culqi';
import { getCulqiWebhookMetadataPedidoKey } from '@/lib/constants/culqi-webhook';
import {
  mapCulqiChargeHttpResponse,
  type CulqiChargeSuccessBody,
} from '@/lib/helpers/culqi-response.helper';
import {
  inferirMetodoPagoDesdeCargoCulqi,
  type CulqiWebhookChargePayload,
} from '@/lib/helpers/culqi-webhook.helper';
import { EstadoPago } from '@prisma/client';
import type { IPaymentGateway } from '@/lib/services/payments/ipayment-gateway';
import { CulqiPedidoPagoError } from '@/lib/services/payments/payment-gateway.error';
import { obtenerMontoCobroPedidoDesdeBd } from '@/lib/services/payments/payment-order-amount.service';
import type {
  CargoProcesadoResult,
  IntencionPagoResult,
  MonedaPago,
  PagoMetadata,
} from '@/lib/services/payments/payment-gateway.types';

function normalizeMoneda(moneda: MonedaPago): CulqiCurrencyCode {
  return moneda?.toUpperCase() === 'USD' ? 'USD' : 'PEN';
}

function resolverPedidoId(metadata: PagoMetadata): number {
  const pedidoId = Number(metadata.pedido_id);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    throw new CulqiPedidoPagoError('ID de pedido inválido', 'PEDIDO_INVALIDO', 400);
  }
  return pedidoId;
}

function resolverEmail(metadata: PagoMetadata): string {
  const email = metadata.email?.trim();
  if (!email) {
    throw new CulqiPedidoPagoError('Correo del cliente requerido', 'EMAIL_REQUERIDO', 400);
  }
  return email;
}

export class CulqiAdapter implements IPaymentGateway {
  readonly gatewayId = 'culqi' as const;

  async crearIntencionPago(
    monto: number,
    moneda: MonedaPago,
    metadata: PagoMetadata,
  ): Promise<IntencionPagoResult> {
    const pedidoId = resolverPedidoId(metadata);
    const montoSolicitado = monto > 0 ? monto : undefined;

    const montoValidado = await obtenerMontoCobroPedidoDesdeBd(
      BigInt(pedidoId),
      montoSolicitado,
    );

    const currencyCode = normalizeMoneda(moneda || montoValidado.currencyCode);

    let clientData: Record<string, unknown> | undefined;
    try {
      const clientConfig = getCulqiClientConfig();
      clientData = {
        publicKey: clientConfig.publicKey,
        rsaId: clientConfig.rsaId,
        rsaPublicKey: clientConfig.rsaPublicKey,
      };
    } catch {
      clientData = undefined;
    }

    return {
      gateway: this.gatewayId,
      intentId: `culqi-intent-${pedidoId}-${montoValidado.amountCents}`,
      monto: montoValidado.amountSoles,
      moneda: currencyCode || CULQI_DEFAULT_CURRENCY,
      amountCents: montoValidado.amountCents,
      metadata: {
        ...metadata,
        pedido_id: pedidoId,
      },
      clientData,
    };
  }

  async procesarCargo(
    token: string,
    monto: number,
    moneda: MonedaPago,
    metadata: PagoMetadata,
  ): Promise<CargoProcesadoResult> {
    const pedidoId = resolverPedidoId(metadata);
    const email = resolverEmail(metadata);
    const paymentSource = token?.trim();

    if (!paymentSource) {
      throw new CulqiPedidoPagoError(
        'Token o source_id de pago requerido',
        'TOKEN_REQUERIDO',
        400,
      );
    }

    const montoValidado = await obtenerMontoCobroPedidoDesdeBd(
      BigInt(pedidoId),
      monto > 0 ? monto : undefined,
    );

    const currencyCode = normalizeMoneda(moneda || montoValidado.currencyCode);

    const culqiResult = await this.ejecutarCargoCulqiApi({
      pedidoId,
      sourceId: paymentSource,
      email,
      amountCents: montoValidado.amountCents,
      currencyCode,
      description: metadata.description,
    });

    if (!culqiResult.success || !culqiResult.data) {
      return {
        success: false,
        gateway: this.gatewayId,
        httpStatus: culqiResult.httpStatus,
        message: culqiResult.message,
        code: culqiResult.code,
      };
    }

    const transactionId = culqiResult.data.id;
    if (!transactionId) {
      throw new CulqiPedidoPagoError(
        'Culqi no devolvió ID de transacción',
        'CULQI_SIN_CHARGE_ID',
        502,
      );
    }

    const chargeData = culqiResult.data as CulqiWebhookChargePayload;

    return {
      success: true,
      gateway: this.gatewayId,
      transactionId,
      monto: montoValidado,
      metodoPago: inferirMetodoPagoDesdeCargoCulqi({
        ...chargeData,
        source_id: paymentSource,
      }),
      estadoPago: EstadoPago.pagado,
      gatewayStatus: 'approved',
      rawData: culqiResult.data as CulqiChargeSuccessBody,
      message: culqiResult.message,
      code: culqiResult.code,
    };
  }

  private async ejecutarCargoCulqiApi(input: {
    pedidoId: number;
    sourceId: string;
    email: string;
    amountCents: number;
    currencyCode: CulqiCurrencyCode;
    description?: string;
  }) {
    const secretKey = getCulqiSecretKey();
    const metadataKey = getCulqiWebhookMetadataPedidoKey();

    const response = await fetch(CULQI_CHARGES_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency_code: input.currencyCode,
        email: input.email.trim(),
        source_id: input.sourceId,
        metadata: { [metadataKey]: String(input.pedidoId) },
        ...(input.description ? { description: input.description } : {}),
      }),
    });

    let body: unknown = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    return mapCulqiChargeHttpResponse(response.status, body);
  }
}

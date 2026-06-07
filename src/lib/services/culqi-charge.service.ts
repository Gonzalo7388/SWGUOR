import { prisma } from '@/lib/prisma';
import {
  CULQI_CHARGES_ENDPOINT,
  CULQI_DEFAULT_CURRENCY,
  getCulqiSecretKey,
  type CulqiCurrencyCode,
} from '@/lib/constants/culqi';
import {
  mapCulqiChargeHttpResponse,
  type CulqiChargeMappedResponse,
  type CulqiChargeSuccessBody,
} from '@/lib/helpers/culqi-response.helper';
import { PedidoNoEncontradoPagoError } from '@/lib/services/pago-idempotencia.service';
import type { MetodoPago } from '@prisma/client';

export class CulqiPedidoPagoError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'CulqiPedidoPagoError';
    this.code = code;
    this.status = status;
  }
}

export interface EjecutarCargoCulqiPedidoInput {
  pedidoId: number;
  token?: string;
  sourceId?: string;
  email: string;
  description?: string;
}

export interface PedidoMontoCobro {
  amountCents: number;
  amountSoles: number;
  currencyCode: CulqiCurrencyCode;
}

export type EjecutarCargoCulqiPedidoResult =
  | {
      success: true;
      culqiChargeId: string;
      culqiData: CulqiChargeSuccessBody;
      monto: PedidoMontoCobro;
      metodoPago: MetodoPago;
      message: string;
      code?: string;
    }
  | {
      success: false;
      httpStatus: number;
      message: string;
      code?: string;
    };

function normalizeCurrency(raw?: string | null): CulqiCurrencyCode {
  const code = (raw ?? CULQI_DEFAULT_CURRENCY).toUpperCase();
  return code === 'USD' ? 'USD' : 'PEN';
}

function inferMetodoPago(
  paymentSource: string,
  chargeData: Record<string, unknown>,
): MetodoPago {
  if (paymentSource === 'bank_transfer') {
    return 'transferencia_bcp';
  }

  const source = chargeData.source as Record<string, unknown> | undefined;
  const sourceType = String(source?.type ?? '').toLowerCase();
  if (sourceType.includes('yape')) return 'yape';
  if (sourceType.includes('plin')) return 'plin';

  const iin = source?.iin as Record<string, unknown> | undefined;
  const brand = String(iin?.card_brand ?? source?.brand ?? '').toLowerCase();
  if (brand.includes('master')) return 'mastercard';
  return 'visa';
}

export async function obtenerMontoCobroPedidoDesdeBd(
  pedidoId: bigint,
): Promise<PedidoMontoCobro> {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: pedidoId },
    select: {
      total: true,
      saldo_pendiente: true,
      monto_pagado: true,
      moneda: true,
    },
  });

  if (!pedido) {
    throw new PedidoNoEncontradoPagoError();
  }

  const total = Number(pedido.total ?? 0);
  const pagado = Number(pedido.monto_pagado ?? 0);
  const saldoRegistrado = Number(pedido.saldo_pendiente ?? 0);
  const amountSoles =
    saldoRegistrado > 0 ? saldoRegistrado : Math.max(total - pagado, 0);

  if (!Number.isFinite(amountSoles) || amountSoles <= 0) {
    throw new CulqiPedidoPagoError(
      'El pedido no tiene saldo pendiente por cobrar',
      'PEDIDO_SIN_SALDO',
      400,
    );
  }

  return {
    amountSoles,
    amountCents: Math.round(amountSoles * 100),
    currencyCode: normalizeCurrency(pedido.moneda),
  };
}

async function ejecutarCargoCulqiApi(input: {
  sourceId: string;
  email: string;
  amountCents: number;
  currencyCode: CulqiCurrencyCode;
  description?: string;
}): Promise<CulqiChargeMappedResponse> {
  const secretKey = getCulqiSecretKey();

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

/**
 * Ejecuta el cargo en Culqi usando el monto del pedido desde BD (no confía en el frontend).
 * No valida idempotencia ni persiste en BD — eso lo orquesta el Route Handler.
 */
export async function ejecutarCargoCulqiPedido(
  input: EjecutarCargoCulqiPedidoInput,
): Promise<EjecutarCargoCulqiPedidoResult> {
  const pedidoId = Number(input.pedidoId);
  const paymentSource = input.sourceId ?? input.token;
  const email = input.email?.trim();

  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    throw new CulqiPedidoPagoError('ID de pedido inválido', 'PEDIDO_INVALIDO', 400);
  }

  if (!paymentSource) {
    throw new CulqiPedidoPagoError(
      'Token o source_id de pago requerido',
      'TOKEN_REQUERIDO',
      400,
    );
  }

  if (!email) {
    throw new CulqiPedidoPagoError('Correo del cliente requerido', 'EMAIL_REQUERIDO', 400);
  }

  const monto = await obtenerMontoCobroPedidoDesdeBd(BigInt(pedidoId));

  const culqiResult = await ejecutarCargoCulqiApi({
    sourceId: paymentSource,
    email,
    amountCents: monto.amountCents,
    currencyCode: monto.currencyCode,
    description: input.description,
  });

  if (!culqiResult.success || !culqiResult.data) {
    return {
      success: false,
      httpStatus: culqiResult.httpStatus,
      message: culqiResult.message,
      code: culqiResult.code,
    };
  }

  const culqiChargeId = culqiResult.data.id;
  if (!culqiChargeId) {
    throw new CulqiPedidoPagoError(
      'Culqi no devolvió ID de transacción',
      'CULQI_SIN_CHARGE_ID',
      502,
    );
  }

  const chargeData = culqiResult.data as Record<string, unknown>;

  return {
    success: true,
    culqiChargeId,
    culqiData: culqiResult.data,
    monto,
    metodoPago: inferMetodoPago(paymentSource, chargeData),
    message: culqiResult.message,
    code: culqiResult.code,
  };
}

export function isCulqiPedidoPagoError(error: unknown): error is CulqiPedidoPagoError {
  return error instanceof CulqiPedidoPagoError;
}

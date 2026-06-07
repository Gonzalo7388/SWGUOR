import { EstadoPago, EstadoPedido } from '@prisma/client';

/**
 * En el esquema Prisma no existe `exitoso`; el equivalente operativo es `pagado`.
 */
export const ESTADO_PAGO_CULQI_EXITOSO = EstadoPago.pagado;

/** Pedido totalmente cubierto tras el cobro Culqi */
export const ESTADO_PEDIDO_PAGO_COMPLETO = EstadoPedido.pagado;

export function buildNotasPagoCulqi(culqiChargeId: string): string {
  return `Pago automático Culqi | charge_id=${culqiChargeId.trim()}`;
}

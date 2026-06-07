import { prisma } from '@/lib/prisma';
import { resolverEstadoPagoHistorialPortal } from '@/lib/helpers/portal-historial-pagos.helper';
import type { HistorialPagoFila } from '@/lib/schemas/portal-historial-pagos';

function formatearCodigoPedido(id: bigint | number): string {
  return `ORD-${String(id).padStart(4, '0')}`;
}

export async function listarHistorialPagosPortal(
  clienteId: bigint,
): Promise<HistorialPagoFila[]> {
  const pedidos = await prisma.pedidos.findMany({
    where: { cliente_id: clienteId },
    select: {
      id: true,
      estado: true,
      total: true,
      monto_pagado: true,
      saldo_pendiente: true,
      moneda: true,
      created_at: true,
      total_unidades: true,
      pagos: {
        where: { estado: 'pagado' },
        orderBy: { fecha_pago: 'desc' },
        take: 1,
        select: {
          id_uuid: true,
          fecha_pago: true,
          comprobantes: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id_uuid: true,
              numero_completo: true,
              serie: true,
              correlativo: true,
              tipo: true,
            },
          },
        },
      },
      comprobantes: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: {
          id_uuid: true,
          numero_completo: true,
          serie: true,
          correlativo: true,
          tipo: true,
          pago_id: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return pedidos.map((pedido) => {
    const ultimoPago = pedido.pagos[0];
    const comprobanteDesdePago = ultimoPago?.comprobantes[0] ?? null;
    const comprobanteFallback = pedido.comprobantes[0] ?? null;
    const comprobanteRaw = comprobanteDesdePago ?? comprobanteFallback;

    const montoPagado = Number(pedido.monto_pagado ?? 0);
    const saldoPendiente = Number(pedido.saldo_pendiente ?? 0);
    const estadoPago = resolverEstadoPagoHistorialPortal(montoPagado, saldoPendiente);

    const fecha =
      ultimoPago?.fecha_pago?.toISOString() ??
      pedido.created_at?.toISOString() ??
      new Date().toISOString();

    return {
      pedido_id: Number(pedido.id),
      codigo: formatearCodigoPedido(pedido.id),
      estado_pedido: pedido.estado ?? 'pendiente',
      estado_pago: estadoPago,
      fecha,
      monto_total: Number(pedido.total ?? 0),
      monto_pagado: montoPagado,
      saldo_pendiente: saldoPendiente,
      moneda: pedido.moneda ?? 'PEN',
      total_unidades: pedido.total_unidades ?? 0,
      pago_id: ultimoPago?.id_uuid ?? comprobanteFallback?.pago_id ?? null,
      comprobante: comprobanteRaw
        ? {
            id: comprobanteRaw.id_uuid,
            numero_completo: comprobanteRaw.numero_completo,
            serie: comprobanteRaw.serie,
            correlativo: comprobanteRaw.correlativo,
            tipo: comprobanteRaw.tipo,
          }
        : null,
    } satisfies HistorialPagoFila;
  });
}

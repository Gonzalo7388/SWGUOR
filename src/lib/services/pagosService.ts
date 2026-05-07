import { prisma } from '@/lib/prisma';
import { pagos, Prisma, EstadoPago, MetodoPago, TipoPago } from '@prisma/client';
import { randomUUID } from 'crypto';

// Campos reales del modelo 'pagos':
//   id_uuid (PK UUID), pedido_id, monto, metodo_pago, fecha_pago,
//   comprobante_url, notas, usuario_id, tipo, estado,
//   verificado_at, verificado_por, created_at, updated_at

interface FiltrosPagos {
  estado?:      EstadoPago;
  metodo_pago?: MetodoPago;
  pedido_id?:   number | bigint;
}

interface CrearPagoInput {
  pedido_id:        number | bigint;
  monto:            Prisma.Decimal | number | string;
  metodo_pago:      MetodoPago;
  tipo?:            TipoPago;
  fecha_pago?:      Date;
  comprobante_url?: string;
  notas?:           string;
  usuario_id?:      number | bigint;
}

export const pagosService = {
  crear: async (datos: CrearPagoInput): Promise<pagos> => {
    return prisma.pagos.create({
      data: {
        id_uuid:         randomUUID(),
        pedido_id:       BigInt(datos.pedido_id),
        monto:           datos.monto,
        metodo_pago:     datos.metodo_pago,
        fecha_pago:      datos.fecha_pago      ?? new Date(),
        tipo:            datos.tipo            ?? 'pago_completo',
        estado:          'pendiente',
        comprobante_url: datos.comprobante_url ?? null,
        notas:           datos.notas           ?? null,
        usuario_id:      datos.usuario_id ? BigInt(datos.usuario_id) : null,
      },
    });
  },

  obtenerTodas: async (filtros?: FiltrosPagos): Promise<pagos[]> => {
    return prisma.pagos.findMany({
      where: {
        ...(filtros?.estado      && { estado:      filtros.estado }),
        ...(filtros?.metodo_pago && { metodo_pago: filtros.metodo_pago }),
        ...(filtros?.pedido_id   && { pedido_id:   BigInt(filtros.pedido_id) }),
      },
      orderBy: { fecha_pago: 'desc' },
    });
  },

  // Verificar pago → estado: 'verificado'
  procesar: async (pagoUuid: string, verificadoPor?: bigint): Promise<pagos> => {
    return prisma.pagos.update({
      where: { id_uuid: pagoUuid },
      data:  {
        estado:         'verificado',
        verificado_at:  new Date(),
        verificado_por: verificadoPor ?? null,
      },
    });
  },

  // Rechazar pago → estado: 'rechazado'
  rechazar: async (pagoUuid: string, motivo: string): Promise<pagos> => {
    return prisma.pagos.update({
      where: { id_uuid: pagoUuid },
      data:  { estado: 'rechazado', notas: motivo },
    });
  },

  // El schema no tiene estado 'reembolsado'; se deja constancia en notas
  reembolsar: async (
    pagoUuid: string,
    motivo: string,
    montoReembolso: number,
  ): Promise<pagos> => {
    return prisma.pagos.update({
      where: { id_uuid: pagoUuid },
      data:  { notas: `REEMBOLSO (${montoReembolso}): ${motivo}` },
    });
  },

  obtenerPendientes: async (): Promise<pagos[]> => {
    return prisma.pagos.findMany({
      where:   { estado: 'pendiente' },
      orderBy: { fecha_pago: 'asc' },
    });
  },

  obtenerVerificados: async (desde: Date, hasta: Date): Promise<pagos[]> => {
    return prisma.pagos.findMany({
      where: {
        estado:    'verificado',
        fecha_pago: { gte: desde, lte: hasta },
      },
      orderBy: { fecha_pago: 'desc' },
    });
  },
};
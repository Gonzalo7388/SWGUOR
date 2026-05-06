import { prisma } from '@/lib/prisma';
import { CrearPago, Pago } from '@/lib/schemas/pagosSchema';

export const pagosService = {
  crear: async (datos: CrearPago): Promise<any> => {
    const ultimoPago = await prisma.pagos.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    const proximoNumero = (ultimoPago?.numero ? parseInt(ultimoPago.numero) : 0) + 1;

    return await prisma.pagos.create({
      data: {
        numero: proximoNumero.toString(),
        comprobanteId: datos.comprobanteId,
        pedidoId: datos.pedidoId,
        ordenCompraId: datos.ordenCompraId,
        fecha: datos.fecha,
        monto: datos.monto,
        moneda: datos.moneda,
        metodoPago: datos.metodoPago,
        estatus: 'PENDIENTE',
        referencia: datos.referencia,
        procesadoPor: datos.procesadoPor,
        observaciones: datos.observaciones,
      },
    }) as Promise<Pago>;
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.estatus) where.estatus = filtros.estatus;
    if (filtros?.metodoPago) where.metodoPago = filtros.metodoPago;

    return await prisma.pagos.findMany({
      where,
      orderBy: { fecha: 'desc' },
    }) as Promise<Pago[]>;
  },

  procesar: async (pagoId: string, numeroTransaccion?: string, referencia?: string): Promise<Pago> => {
    return await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        estatus: 'COMPLETADO',
        numeroTransaccion,
        referencia,
      },
    }) as Promise<Pago>;
  },

  rechazar: async (pagoId: string, motivo: string): Promise<Pago> => {
    return await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        estatus: 'RECHAZADO',
        detalleRechazo: motivo,
      },
    }) as Promise<Pago>;
  },

  reembolsar: async (pagoId: string, motivo: string, montoReembolso: number): Promise<Pago> => {
    return await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        estatus: 'REEMBOLSADO',
        observaciones: `REEMBOLSO: ${motivo}`,
      },
    }) as Promise<Pago>;
  },

  obtenerPendientes: async (): Promise<Pago[]> => {
    return await prisma.pagos.findMany({
      where: { estatus: 'PENDIENTE' },
      orderBy: { fecha: 'asc' },
    }) as Promise<Pago[]>;
  },

  obtenerCompletados: async (desde: Date, hasta: Date): Promise<Pago[]> => {
    return await prisma.pagos.findMany({
      where: {
        estatus: 'COMPLETADO',
        fecha: { gte: desde, lte: hasta },
      },
      orderBy: { fecha: 'desc' },
    }) as Promise<Pago[]>;
  },
};

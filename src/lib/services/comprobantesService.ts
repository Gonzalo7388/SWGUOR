import { prisma } from '@/lib/prisma';
import { CrearComprobante, Comprobante } from '@/lib/schemas/comprobantesSchema';

export const comprobantesService = {
  crear: async (datos: CrearComprobante): Promise<any> => {
    const ultimoComprobante = await prisma.comprobantes.findFirst({
      where: { serie: datos.serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    const proximoNumero = (ultimoComprobante?.numero ? parseInt(ultimoComprobante.numero) : 0) + 1;

    return await prisma.comprobantes.create({
      data: {
        numero: proximoNumero.toString(),
        serie: datos.serie,
        tipo: datos.tipo,
        estado: 'BORRADOR',
        clienteId: datos.clienteId,
        fecha: datos.fecha,
        fechaVencimiento: datos.fechaVencimiento,
        montoSubtotal: datos.montoSubtotal,
        igv: datos.igv,
        otrosCargos: datos.otrosCargos,
        descuento: datos.descuento,
        montoTotal: datos.montoTotal,
        moneda: datos.moneda,
        metodoPago: datos.metodoPago,
        referencia: datos.referencia,
        observaciones: datos.observaciones,
        emitidoPor: datos.emitidoPor,
      },
    }) as Promise<Comprobante>;
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.clienteId) where.clienteId = filtros.clienteId;
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.estado) where.estado = filtros.estado;

    return await prisma.comprobantes.findMany({
      where,
      orderBy: { fecha: 'desc' },
    }) as Promise<Comprobante[]>;
  },

  anular: async (comprobanteId: string, motivo: string): Promise<Comprobante> => {
    return await prisma.comprobantes.update({
      where: { id: comprobanteId },
      data: {
        estado: 'ANULADA',
        observaciones: `ANULADO: ${motivo}`,
      },
    }) as Promise<Comprobante>;
  },

  obtenerPendientes: async (): Promise<Comprobante[]> => {
    return await prisma.comprobantes.findMany({
      where: {
        estado: { in: ['EMITIDA', 'ENVIADA'] },
      },
      orderBy: { fechaVencimiento: 'asc' },
    }) as Promise<Comprobante[]>;
  },

  obtenerVencidas: async (): Promise<Comprobante[]> => {
    const ahora = new Date();
    return await prisma.comprobantes.findMany({
      where: {
        fechaVencimiento: { lt: ahora },
        estado: { not: 'PAGADA' },
      },
      orderBy: { fechaVencimiento: 'asc' },
    }) as Promise<Comprobante[]>;
  },

  marcarComoPagada: async (comprobanteId: string): Promise<Comprobante> => {
    return await prisma.comprobantes.update({
      where: { id: comprobanteId },
      data: { estado: 'PAGADA' },
    }) as Promise<Comprobante>;
  },
};

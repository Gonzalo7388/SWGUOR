import { prisma } from '@/lib/prisma';
import { CrearComprobante, Comprobante } from '@/lib/schemas/comprobantesSchema';

export const comprobantesService = {
  crear: async (datos: CrearComprobante): Promise<any> => {
    const ultimoComprobante = await prisma.comprobantes.findFirst({
      where: { serie: datos.serie },
      orderBy: { correlativo: 'desc' },
      select: { correlativo: true },
    });

    const proximoNumero = (ultimoComprobante?.correlativo ? parseInt(ultimoComprobante.correlativo) : 0) + 1;

    return await prisma.comprobantes.create({
      data: {
        correlativo: proximoNumero.toString(),
        serie: datos.serie,
        tipo: datos.tipo,
        moneda: datos.moneda,
        ruc_emisor: datos.ruc_emisor || '',
        fecha_emision: datos.fecha || new Date(),
        subtotal: datos.subtotal || 0,
        igv: datos.igv || 0,
        total: datos.total || 0,
      },
    }) as Promise<any>;
  },

  listar: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.clienteId) where.clienteId = filtros.clienteId;
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.estado) where.estado = filtros.estado;

    return await prisma.comprobantes.findMany({
      where,
      orderBy: { fecha_emision: 'desc' },
    }) as unknown as Promise<any[]>;
  },

  anular: async (comprobanteId: string, motivo: string): Promise<any> => {
    return await prisma.comprobantes.update({
      where: { id_uuid: comprobanteId },
      data: {
        pdf_url: `ANULADO: ${motivo}`,
      },
    }) as Promise<any>;
  },

  obtenerPendientes: async (): Promise<any[]> => {
    return await prisma.comprobantes.findMany({
      orderBy: { fecha_emision: 'asc' },
    }) as Promise<any[]>;
  },

  obtenerVencidas: async (): Promise<any[]> => {
    const ahora = new Date();
    return await prisma.comprobantes.findMany({
      where: {
        fecha_emision: { lt: ahora },
      },
      orderBy: { fecha_emision: 'asc' },
    }) as Promise<any[]>;
  },

  marcarComoPagada: async (comprobanteId: string): Promise<any> => {
    return await prisma.comprobantes.update({
      where: { id_uuid: comprobanteId },
      data: { fecha_emision: new Date() },
    }) as Promise<any>;
  },
};

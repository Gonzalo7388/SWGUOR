import { prisma } from '@/lib/prisma';
import { CrearGuiaRemision, GuiaRemision } from '@/lib/schemas/guiasRemisionSchema';

export const guiasRemisionService = {
  crear: async (datos: CrearGuiaRemision): Promise<any> => {
    const ultimaGuia = await prisma.guiasRemision.findFirst({
      where: { serie: datos.serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    const proximoNumero = (ultimaGuia?.numero ? parseInt(ultimaGuia.numero) : 0) + 1;

    return await prisma.guiasRemision.create({
      data: {
        numero: proximoNumero.toString(),
        serie: datos.serie,
        almacenOrigen: datos.almacenOrigen,
        almacenDestino: datos.almacenDestino,
        ordenCompraId: datos.ordenCompraId,
        pedidoId: datos.pedidoId,
        fecha: datos.fecha,
        transportista: datos.transportista,
        placa: datos.placa,
        conductor: datos.conductor,
        documentoConductor: datos.documentoConductor,
        pesoTotal: datos.pesoTotal,
        volumen: datos.volumen,
        observaciones: datos.observaciones,
        estatus: 'GENERADA',
      },
    }) as Promise<GuiaRemision>;
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.almacenOrigen) where.almacenOrigen = filtros.almacenOrigen;
    if (filtros?.almacenDestino) where.almacenDestino = filtros.almacenDestino;
    if (filtros?.estatus) where.estatus = filtros.estatus;

    return await prisma.guiasRemision.findMany({
      where,
      orderBy: { fecha: 'desc' },
    }) as Promise<GuiaRemision[]>;
  },

  entregar: async (guiaId: string, firmaDestino: string, observacionesEntrega?: string): Promise<GuiaRemision> => {
    return await prisma.guiasRemision.update({
      where: { id: guiaId },
      data: {
        estatus: 'ENTREGADA',
        firmaDestino,
        fechaEntrega: new Date(),
        observaciones: observacionesEntrega || undefined,
      },
    }) as Promise<GuiaRemision>;
  },

  obtenerEnTransito: async (): Promise<GuiaRemision[]> => {
    return await prisma.guiasRemision.findMany({
      where: { estatus: 'EN_TRANSITO' },
      orderBy: { fecha: 'asc' },
    }) as Promise<GuiaRemision[]>;
  },

  obtenerPendientes: async (): Promise<GuiaRemision[]> => {
    return await prisma.guiasRemision.findMany({
      where: { estatus: 'GENERADA' },
      orderBy: { fecha: 'asc' },
    }) as Promise<GuiaRemision[]>;
  },
};

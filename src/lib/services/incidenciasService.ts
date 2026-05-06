import { prisma } from '@/lib/prisma';
import { CrearIncidencia, Incidencia } from '@/lib/schemas/incidenciasSchema';

export const incidenciasService = {
  crear: async (datos: CrearIncidencia): Promise<Incidencia> => {
    const ultimaIncidencia = await prisma.incidencias.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    const proximoNumero = (ultimaIncidencia?.numero ? parseInt(ultimaIncidencia.numero) : 0) + 1;

    return await prisma.incidencias.create({
      data: {
        numero: proximoNumero.toString(),
        tipo: datos.tipo,
        prioridad: datos.prioridad,
        estatus: 'ABIERTA',
        pedidoId: datos.pedidoId,
        ordenCompraId: datos.ordenCompraId,
        reportadoPor: datos.reportadoPor,
        reportadoA: datos.reportadoA,
        descripcion: datos.descripcion,
        fechaReporte: datos.fechaReporte,
        fechaVencimiento: datos.fechaVencimiento,
        montoAfectado: datos.montoAfectado,
        moneda: datos.moneda,
        asignadoA: datos.asignadoA,
      },
    }) as Promise<Incidencia>;
  },

  obtenerTodas: async (filtros?: any): Promise<Incidencia[]> => {
    const where: any = {};
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.estatus) where.estatus = filtros.estatus;
    if (filtros?.prioridad) where.prioridad = filtros.prioridad;

    return await prisma.incidencias.findMany({
      where,
      orderBy: { fechaReporte: 'desc' },
    }) as Promise<Incidencia[]>;
  },

  resolver: async (incidenciaId: string, resolucion: string, montoResolucion?: number): Promise<Incidencia> => {
    return await prisma.incidencias.update({
      where: { id: incidenciaId },
      data: {
        estatus: 'RESUELTA',
        resolucion,
        fechaResolucion: new Date(),
        montoAfectado: montoResolucion,
      },
    }) as Promise<Incidencia>;
  },

  asignar: async (incidenciaId: string, asignadoA: string): Promise<Incidencia> => {
    return await prisma.incidencias.update({
      where: { id: incidenciaId },
      data: {
        asignadoA,
        estatus: 'EN_PROCESO',
      },
    }) as Promise<Incidencia>;
  },

  obtenerAbiertas: async (): Promise<Incidencia[]> => {
    return await prisma.incidencias.findMany({
      where: { estatus: 'ABIERTA' },
      orderBy: { prioridad: 'desc' },
    }) as Promise<Incidencia[]>;
  },

  obtenerUrgentes: async (): Promise<Incidencia[]> => {
    return await prisma.incidencias.findMany({
      where: {
        prioridad: { in: ['ALTA', 'CRITICA'] },
        estatus: { not: 'CERRADA' },
      },
      orderBy: { fechaReporte: 'desc' },
    }) as Promise<Incidencia[]>;
  },
};

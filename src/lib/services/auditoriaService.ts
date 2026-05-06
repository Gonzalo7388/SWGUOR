import { prisma } from '@/lib/prisma';
import { Auditoria } from '@/lib/schemas/auditoriaSchema';

export const auditoriaService = {
  registrar: async (datos: Omit<Auditoria, 'id' | 'timestamp'>): Promise<any> => {
    return await prisma.auditoria.create({
      data: {
        usuario: datos.usuario,
        accion: datos.accion,
        tabla: datos.tabla,
        registroId: datos.registroId,
        cambios: datos.cambios,
        ipOrigen: datos.ipOrigen,
        userAgent: datos.userAgent,
        estatus: datos.estatus,
        detalleError: datos.detalleError,
        modulo: datos.modulo,
        descripcion: datos.descripcion,
        sessionId: datos.sessionId,
        timestamp: new Date(),
      },
    });
  },

  obtenerRegistros: async (filtros?: any, pagina: number = 1, limite: number = 50): Promise<any[]> => {
    const where: any = {};
    if (filtros?.usuario) where.usuario = filtros.usuario;
    if (filtros?.accion) where.accion = filtros.accion;
    if (filtros?.tabla) where.tabla = filtros.tabla;
    if (filtros?.estatus) where.estatus = filtros.estatus;

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.auditoria.count({ where }),
    ]);

    return {
      registros,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  obtenerPorTabla: async (tabla: string, registroId: string): Promise<any[]> => {
    return await prisma.auditoria.findMany({
      where: { tabla, registroId },
      orderBy: { timestamp: 'desc' },
    });
  },

  obtenerPorUsuario: async (usuarioId: string, desde?: Date, hasta?: Date): Promise<any[]> => {
    const where: any = { usuario: usuarioId };
    if (desde || hasta) {
      where.timestamp = {};
      if (desde) where.timestamp.gte = desde;
      if (hasta) where.timestamp.lte = hasta;
    }

    return await prisma.auditoria.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
  },

  obtenerErrores: async (desde?: Date, hasta?: Date): Promise<any[]> => {
    const where: any = { estatus: 'ERROR' };
    if (desde || hasta) {
      where.timestamp = {};
      if (desde) where.timestamp.gte = desde;
      if (hasta) where.timestamp.lte = hasta;
    }

    return await prisma.auditoria.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
  },

  limpiarRegistrosAntiguos: async (diasAnterior: number = 90): Promise<number> => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAnterior);

    const result = await prisma.auditoria.deleteMany({
      where: { timestamp: { lt: fecha } },
    });
    return result.count;
  },

  generarResumen: async (desde: Date, hasta: Date) => {
    const registros = await prisma.auditoria.findMany({
      where: {
        timestamp: { gte: desde, lte: hasta },
      },
    });

    return {
      total: registros.length,
      porAccion: registros.reduce((acc: any, r: any) => {
        acc[r.accion] = (acc[r.accion] || 0) + 1;
        return acc;
      }, {}),
      porUsuario: registros.reduce((acc: any, r: any) => {
        acc[r.usuario] = (acc[r.usuario] || 0) + 1;
        return acc;
      }, {}),
      porModulo: registros.reduce((acc: any, r: any) => {
        acc[r.modulo] = (acc[r.modulo] || 0) + 1;
        return acc;
      }, {}),
      errores: registros.filter(r => r.estatus === 'ERROR').length,
    };
  },
};

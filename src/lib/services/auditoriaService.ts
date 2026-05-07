import { prisma } from '@/lib/prisma';

// Auditoria service - compatible con el schema real de Prisma
export const auditoriaService = {
  registrar: async (datos: {
    usuario_id?: bigint | null;
    accion: string;
    tabla: string;
    registro_id: bigint;
    datos_antes?: any;
    datos_despues?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<any> => {
    try {
      return await prisma.auditoria.create({
        data: {
          usuario_id: datos.usuario_id || null,
          accion: datos.accion as any,
          tabla: datos.tabla,
          registro_id: datos.registro_id,
          datos_antes: datos.datos_antes || null,
          datos_despues: datos.datos_despues || null,
          ip_address: datos.ip_address || null,
          user_agent: datos.user_agent || null,
        },
      });
    } catch (error) {
      console.error('Error registrando auditoria:', error);
      return null;
    }
  },

  obtenerRegistros: async (filtros?: any, pagina: number = 1, limite: number = 50): Promise<any> => {
    const where: any = {};
    if (filtros?.accion) where.accion = filtros.accion;
    if (filtros?.tabla) where.tabla = filtros.tabla;
    if (filtros?.usuario_id) where.usuario_id = filtros.usuario_id;

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        orderBy: { created_at: 'desc' },
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

  obtenerPorTabla: async (tabla: string, registro_id: bigint): Promise<any[]> => {
    return await prisma.auditoria.findMany({
      where: { tabla, registro_id },
      orderBy: { created_at: 'desc' },
    });
  },

  obtenerPorUsuario: async (usuario_id: bigint, desde?: Date, hasta?: Date): Promise<any[]> => {
    const where: any = { usuario_id };
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = desde;
      if (hasta) where.created_at.lte = hasta;
    }

    return await prisma.auditoria.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  },

  limpiarRegistrosAntiguos: async (diasAnterior: number = 90): Promise<number> => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAnterior);

    const result = await prisma.auditoria.deleteMany({
      where: { created_at: { lt: fecha } },
    });
    return result.count;
  },

  generarResumen: async (desde: Date, hasta: Date) => {
    const registros = await prisma.auditoria.findMany({
      where: {
        created_at: { gte: desde, lte: hasta },
      },
    });

    return {
      total: registros.length,
      porAccion: registros.reduce((acc: any, r: any) => {
        acc[r.accion] = (acc[r.accion] || 0) + 1;
        return acc;
      }, {}),
      porTabla: registros.reduce((acc: any, r: any) => {
        acc[r.tabla] = (acc[r.tabla] || 0) + 1;
        return acc;
      }, {}),
    };
  },
};

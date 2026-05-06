import { prisma } from '@/lib/prisma';
import { CrearNotificacion, Notificacion } from '@/lib/schemas/notificacionesSchema';

export const notificacionesService = {
  crear: async (datos: CrearNotificacion): Promise<Notificacion> => {
    return await prisma.notificaciones.create({
      data: {
        usuario_id: datos.usuario_id,
        tipo: datos.tipo,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        canal: datos.canal,
        prioridad: datos.prioridad,
        leida: false,
      },
    }) as any as Promise<Notificacion>;
  },

  obtenerPorUsuario: async (usuarioId: number, filtros?: any): Promise<Notificacion[]> => {
    const where: any = { usuario_id: usuarioId };
    
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.canal) where.canal = filtros.canal;
    if (filtros?.soloNoLeidas) where.leida = false;

    return await prisma.notificaciones.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filtros?.limite || 50,
    }) as any as Promise<Notificacion[]>;
  },

  marcarComoLeida: async (notificacionId: string): Promise<Notificacion> => {
    return await prisma.notificaciones.update({
      where: { id: BigInt(notificacionId) },
      data: { leida: true },
    }) as any as Promise<Notificacion>;
  },

  marcarTodasComoLeidas: async (usuarioId: number): Promise<any> => {
    return await prisma.notificaciones.updateMany({
      where: { usuario_id: usuarioId, leida: false },
      data: { leida: true },
    });
  },

  obtenerNoLeidas: async (usuarioId: number): Promise<number> => {
    const count = await prisma.notificaciones.count({
      where: { usuario_id: usuarioId, leida: false },
    });
    return count;
  },

  limpiarAntiguas: async (diasRetener: number = 30): Promise<any> => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetener);

    return await prisma.notificaciones.deleteMany({
      where: {
        leida: true,
        created_at: { lt: fechaLimite },
      },
    });
  },
};

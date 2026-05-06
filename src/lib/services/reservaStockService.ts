import { prisma } from '@/lib/prisma';
import { CrearReserva, ReservaStock, ActualizarReserva } from '@/lib/schemas/reservaStockSchema';

export const reservaStockService = {
  crear: async (datos: CrearReserva): Promise<ReservaStock> => {
    return await prisma.reservasStock.create({
      data: {
        productoId: datos.productoId,
        almacenId: datos.almacenId,
        cantidadReservada: datos.cantidadReservada,
        cantidadDisponible: datos.cantidadDisponible,
        pedidoId: datos.pedidoId,
        ordenCompraId: datos.ordenCompraId,
        motivo: datos.motivo,
        estatus: 'ACTIVA',
        fechaExpiracion: datos.fechaExpiracion,
        notas: datos.notas,
      },
    }) as Promise<ReservaStock>;
  },

  obtenerTodas: async (filtros?: any): Promise<ReservaStock[]> => {
    const where: any = {};
    if (filtros?.almacenId) where.almacenId = filtros.almacenId;
    if (filtros?.productoId) where.productoId = filtros.productoId;
    if (filtros?.estatus) where.estatus = filtros.estatus;
    if (filtros?.motivo) where.motivo = filtros.motivo;

    return await prisma.reservasStock.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as Promise<ReservaStock[]>;
  },

  obtenerPorId: async (id: string): Promise<ReservaStock | null> => {
    return await prisma.reservasStock.findUnique({
      where: { id },
    }) as Promise<ReservaStock | null>;
  },

  utilizar: async (id: string, cantidad: number): Promise<ReservaStock> => {
    const reserva = await prisma.reservasStock.findUnique({ where: { id } });
    if (!reserva) throw new Error('Reserva no encontrada');

    const nuevaDisponible = Math.max(0, (reserva.cantidadDisponible as number) - cantidad);
    const nuevoEstatus = nuevaDisponible === 0 ? 'UTILIZADA' : 'PARCIAL_UTILIZADA';

    return await prisma.reservasStock.update({
      where: { id },
      data: {
        cantidadDisponible: nuevaDisponible,
        estatus: nuevoEstatus,
        fechaUso: new Date(),
      },
    }) as Promise<ReservaStock>;
  },

  cancelar: async (id: string, motivoCancelacion: string): Promise<ReservaStock> => {
    return await prisma.reservasStock.update({
      where: { id },
      data: {
        estatus: 'CANCELADA',
        notas: `CANCELADA: ${motivoCancelacion}`,
      },
    }) as Promise<ReservaStock>;
  },

  obtenerReservasVencidas: async (): Promise<ReservaStock[]> => {
    return await prisma.reservasStock.findMany({
      where: {
        estatus: { not: 'CANCELADA' },
        fechaExpiracion: { lt: new Date() },
      },
    }) as Promise<ReservaStock[]>;
  },

  obtenerResumenPorAlmacen: async (almacenId: string) => {
    const reservas = await prisma.reservasStock.findMany({
      where: { almacenId },
    });

    return {
      totalReservado: reservas.reduce((sum, r) => sum + (r.cantidadReservada as number), 0),
      totalDisponible: reservas.reduce((sum, r) => sum + (r.cantidadDisponible as number), 0),
      totalUtilizado: reservas.reduce((sum, r) => sum + ((r.cantidadReservada as number) - (r.cantidadDisponible as number)), 0),
      cantidad: reservas.length,
    };
  },
};

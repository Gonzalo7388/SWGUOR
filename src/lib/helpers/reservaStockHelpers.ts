import { ReservaStock } from '@/lib/schemas/reservaStockSchema';

export const reservaStockHelpers = {
  estaActiva: (reserva: ReservaStock): boolean =>
    reserva.estatus === 'ACTIVA',

  obtenerPorcentajeUtilizado: (reserva: ReservaStock): number =>
    ((reserva.cantidadReservada - reserva.cantidadDisponible) / reserva.cantidadReservada) * 100,

  estaCancelada: (reserva: ReservaStock): boolean =>
    reserva.estatus === 'CANCELADA',

  estaVencida: (reserva: ReservaStock): boolean => {
    if (!reserva.fechaExpiracion) return false;
    return new Date() > reserva.fechaExpiracion;
  },

  necesitaAlerta: (reserva: ReservaStock): boolean =>
    reserva.estaVencida || reserva.cantidadDisponible === 0,

  agruparPorMotivo: (reservas: ReservaStock[]) =>
    reservas.reduce((acc, curr) => {
      if (!acc[curr.motivo]) acc[curr.motivo] = [];
      acc[curr.motivo].push(curr);
      return acc;
    }, {} as Record<string, ReservaStock[]>),

  agruparPorEstatus: (reservas: ReservaStock[]) =>
    reservas.reduce((acc, curr) => {
      if (!acc[curr.estatus]) acc[curr.estatus] = [];
      acc[curr.estatus].push(curr);
      return acc;
    }, {} as Record<string, ReservaStock[]>),

  obtenerResumenCapacidad: (reservas: ReservaStock[]) => ({
    totalReservado: reservas.reduce((sum, r) => sum + r.cantidadReservada, 0),
    totalDisponible: reservas.reduce((sum, r) => sum + r.cantidadDisponible, 0),
    totalUtilizado: reservas.reduce((sum, r) => sum + (r.cantidadReservada - r.cantidadDisponible), 0),
  }),

  filtrarActivasYVigentes: (reservas: ReservaStock[]) =>
    reservas.filter(r => reservaStockHelpers.estaActiva(r) && !reservaStockHelpers.estaVencida(r)),
};

import { ReservaStock } from '@/lib/schemas/reservaStockSchema';

export const reservaStockHelpers = {
  estaActiva: (reserva: ReservaStock): boolean =>
    reserva.estado === 'activa',

  estaCancelada: (reserva: ReservaStock): boolean =>
    reserva.estado === 'cancelada',

  estaVencida: (reserva: ReservaStock): boolean => {
    if (!reserva.expira_en) return false;
    return new Date() > reserva.expira_en;
  },

  necesitaAlerta: (reserva: ReservaStock): boolean =>
    reservaStockHelpers.estaVencida(reserva) || reserva.cantidad === 0,

  agruparPorEstado: (reservas: ReservaStock[]) =>
    reservas.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, ReservaStock[]>),

  obtenerResumenCapacidad: (reservas: ReservaStock[]) => ({
    totalReservado: reservas.reduce((sum, r) => sum + r.cantidad, 0),
    totalUtilizado: 0,
  }),

  filtrarActivasYVigentes: (reservas: ReservaStock[]) =>
    reservas.filter(r => reservaStockHelpers.estaActiva(r) && !reservaStockHelpers.estaVencida(r)),
};

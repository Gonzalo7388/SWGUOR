import { Notificacion, TipoNotificacion } from '@/lib/schemas/notificaciones';

export const notificacionesHelpers = {
  filtrarPorEstatus: (notificaciones: Notificacion[], leido: boolean) =>
    notificaciones.filter(n => n.leido === leido),

  filtrarPorTipo: (notificaciones: Notificacion[], tipo: TipoNotificacion) =>
    notificaciones.filter(n => n.tipo === tipo),

  agruparPorTipo: (notificaciones: Notificacion[]) =>
    notificaciones.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<TipoNotificacion, Notificacion[]>),

  obtenerNoLeidas: (notificaciones: Notificacion[]) =>
    notificaciones.filter(n => !n.leido),

  marcarMultiplesComoLeidas: (notificaciones: Notificacion[], ids: number[]) =>
    notificaciones.map(n =>
      ids.includes(n.id) ? { ...n, leido: true } : n
    ),

  obtenerResumenNotificaciones: (notificaciones: Notificacion[]) => ({
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => !n.leido).length,
    porTipo: Object.entries(
      notificaciones.reduce((acc, n) => {
        acc[n.tipo] = (acc[n.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  }),
};

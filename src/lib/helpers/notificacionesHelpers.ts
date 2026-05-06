import { Notificacion, TipoNotificacion, CanalNotificacion } from '@/lib/schemas/notificacionesSchema';

export const notificacionesHelpers = {
  filtrarPorEstatus: (notificaciones: Notificacion[], leida: boolean) => 
    notificaciones.filter(n => n.leida === leida),

  filtrarPorTipo: (notificaciones: Notificacion[], tipo: TipoNotificacion) => 
    notificaciones.filter(n => n.tipo === tipo),

  filtrarPorCanal: (notificaciones: Notificacion[], canal: CanalNotificacion) => 
    notificaciones.filter(n => n.canal === canal),

  agruparPorTipo: (notificaciones: Notificacion[]) =>
    notificaciones.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<TipoNotificacion, Notificacion[]>),

  obtenerNoLeidasPorCanal: (notificaciones: Notificacion[]) =>
    notificaciones
      .filter(n => !n.leida)
      .reduce((acc, curr) => {
        if (!acc[curr.canal]) acc[curr.canal] = 0;
        acc[curr.canal]++;
        return acc;
      }, {} as Record<CanalNotificacion, number>),

  marcarMultiplesComoLeidas: (notificaciones: Notificacion[], ids: string[]) =>
    notificaciones.map(n => 
      ids.includes(n.id) ? { ...n, leida: true } : n
    ),

  obtenerResumenNotificaciones: (notificaciones: Notificacion[]) => ({
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => !n.leida).length,
    criticas: notificaciones.filter(n => n.prioridad === 'CRITICA').length,
    porTipo: Object.entries(
      notificaciones.reduce((acc, n) => {
        acc[n.tipo] = (acc[n.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  }),
};

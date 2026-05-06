import { GuiaRemision } from '@/lib/schemas/guiasRemisionSchema';

export const guiasRemisionHelpers = {
  estaEnTransito: (guia: GuiaRemision): boolean =>
    guia.estatus === 'EN_TRANSITO',

  estaEntregada: (guia: GuiaRemision): boolean =>
    guia.estatus === 'ENTREGADA',

  estaPendiente: (guia: GuiaRemision): boolean =>
    guia.estatus === 'GENERADA',

  estaCancelada: (guia: GuiaRemision): boolean =>
    guia.estatus === 'CANCELADA' || guia.estatus === 'RECHAZADA',

  agruparPorEstatus: (guias: GuiaRemision[]) =>
    guias.reduce((acc, curr) => {
      if (!acc[curr.estatus]) acc[curr.estatus] = [];
      acc[curr.estatus].push(curr);
      return acc;
    }, {} as Record<string, GuiaRemision[]>),

  filtrarPendientes: (guias: GuiaRemision[]) =>
    guias.filter(g => guiasRemisionHelpers.estaPendiente(g)),

  filtrarEnTransito: (guias: GuiaRemision[]) =>
    guias.filter(g => guiasRemisionHelpers.estaEnTransito(g)),

  obtenerPesoTotal: (guias: GuiaRemision[]): number =>
    guias.reduce((sum, g) => sum + g.pesoTotal, 0),

  obtenerVolumenTotal: (guias: GuiaRemision[]): number =>
    guias.reduce((sum, g) => sum + (g.volumen || 0), 0),

  calcularDensidad: (guia: GuiaRemision): number | null => {
    if (!guia.volumen || guia.volumen === 0) return null;
    return guia.pesoTotal / guia.volumen;
  },

  obtenerTiempoTransito: (guia: GuiaRemision): string | null => {
    if (!guia.fechaEntrega || guia.estatus !== 'ENTREGADA') return null;
    const inicio = new Date(guia.fecha);
    const fin = new Date(guia.fechaEntrega);
    const horas = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
    return `${horas} horas`;
  },
};

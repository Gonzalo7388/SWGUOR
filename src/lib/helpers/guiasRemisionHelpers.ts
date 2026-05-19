import { GuiaRemision } from '@/lib/schemas/guias-remision';

export const guiasRemisionHelpers = {
  estaEnTransito: (guia: GuiaRemision): boolean =>
    guia.estado === 'en_transito',

  estaEntregada: (guia: GuiaRemision): boolean =>
    guia.estado === 'entregada',

  estaPendiente: (guia: GuiaRemision): boolean =>
    guia.estado === 'borrador' || guia.estado === 'emitida',

  estaCancelada: (guia: GuiaRemision): boolean =>
    guia.estado === 'anulada',

  agruparPorEstado: (guias: GuiaRemision[]) =>
    guias.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, GuiaRemision[]>),

  agruparPorTipo: (guias: GuiaRemision[]) =>
    guias.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<string, GuiaRemision[]>),

  filtrarPendientes: (guias: GuiaRemision[]) =>
    guias.filter(g => guiasRemisionHelpers.estaPendiente(g)),

  filtrarEnTransito: (guias: GuiaRemision[]) =>
    guias.filter(g => guiasRemisionHelpers.estaEnTransito(g)),

  filtrarEntregadas: (guias: GuiaRemision[]) =>
    guias.filter(g => guiasRemisionHelpers.estaEntregada(g)),

  obtenerTiempoTransito: (guia: GuiaRemision): string | null => {
    if (!guia.fecha_entrega || guia.estado !== 'entregada') return null;
    const inicio = new Date(guia.fecha_emision);
    const fin = new Date(guia.fecha_entrega);
    const horas = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
    return `${horas} horas`;
  },

  obtenerDiasDesdeEmision: (guia: GuiaRemision): number => {
    const hoy = new Date();
    const dias = Math.floor((hoy.getTime() - guia.fecha_emision.getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  },
};

import { Incidencia } from '@/lib/schemas/incidenciasSchema';

export const incidenciasHelpers = {
  estaAbierta: (incidencia: Incidencia): boolean =>
    incidencia.estatus === 'ABIERTA',

  estaResuelta: (incidencia: Incidencia): boolean =>
    incidencia.estatus === 'RESUELTA' || incidencia.estatus === 'CERRADA',

  estaCancelada: (incidencia: Incidencia): boolean =>
    incidencia.estatus === 'CANCELADA',

  esUrgente: (incidencia: Incidencia): boolean =>
    incidencia.prioridad === 'ALTA' || incidencia.prioridad === 'CRITICA',

  estaAtrasada: (incidencia: Incidencia): boolean => {
    if (!incidencia.fechaVencimiento) return false;
    return new Date() > incidencia.fechaVencimiento && !incidenciasHelpers.estaResuelta(incidencia);
  },

  agruparPorPrioridad: (incidencias: Incidencia[]) =>
    incidencias.reduce((acc, curr) => {
      if (!acc[curr.prioridad]) acc[curr.prioridad] = [];
      acc[curr.prioridad].push(curr);
      return acc;
    }, {} as Record<string, Incidencia[]>),

  agruparPorTipo: (incidencias: Incidencia[]) =>
    incidencias.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<string, Incidencia[]>),

  filtrarAbiertas: (incidencias: Incidencia[]) =>
    incidencias.filter(i => incidenciasHelpers.estaAbierta(i)),

  filtrarUrgentes: (incidencias: Incidencia[]) =>
    incidencias.filter(i => incidenciasHelpers.esUrgente(i)),

  filtrarAtrasadas: (incidencias: Incidencia[]) =>
    incidencias.filter(i => incidenciasHelpers.estaAtrasada(i)),

  obtenerMontoTotalAfectado: (incidencias: Incidencia[]): number =>
    incidencias.reduce((sum, i) => sum + (i.montoAfectado || 0), 0),

  calcularTiempoResolucion: (incidencia: Incidencia): string | null => {
    if (!incidencia.fechaResolucion) return null;
    const inicio = new Date(incidencia.fechaReporte);
    const fin = new Date(incidencia.fechaResolucion);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return `${dias} días`;
  },
};

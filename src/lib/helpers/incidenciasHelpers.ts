import { Incidencia } from '@/lib/schemas/incidenciasSchema';

export const incidenciasHelpers = {
  estaAbierta: (incidencia: Incidencia): boolean =>
    !incidencia.resuelto,

  estaResuelta: (incidencia: Incidencia): boolean =>
    incidencia.resuelto,

  estaCancelada: (incidencia: Incidencia): boolean =>
    false, // No hay estado cancelada en el schema

  esUrgente: (incidencia: Incidencia): boolean =>
    incidencia.severidad === 'alta' || incidencia.severidad === 'critica',

  estaAtrasada: (incidencia: Incidencia): boolean => {
    // Una incidencia está atrasada si su impacto_horas excede un umbral
    return incidencia.impacto_horas ? incidencia.impacto_horas > 24 : false;
  },

  agruparPorSeveridad: (incidencias: Incidencia[]) =>
    incidencias.reduce((acc, curr) => {
      if (!acc[curr.severidad]) acc[curr.severidad] = [];
      acc[curr.severidad].push(curr);
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

  obtenerTotalImpactoHoras: (incidencias: Incidencia[]): number =>
    incidencias.reduce((sum, i) => sum + (i.impacto_horas || 0), 0),

  calcularTiempoResolucion: (incidencia: Incidencia): string | null => {
    if (!incidencia.fecha_resolucion) return null;
    const inicio = new Date(incidencia.fecha_reporte);
    const fin = new Date(incidencia.fecha_resolucion);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return `${dias} días`;
  },
};

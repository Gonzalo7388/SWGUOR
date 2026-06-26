/** Valores del enum `EtapaConfeccion` en Supabase (seguimiento y columna confecciones.etapa). */
export const ETAPAS_CONFECCION = [
  'recepcion_cortes',
  'confeccion_y_remalle',
  'acabado_y_limpieza',
  'planchado_y_empaque',
  'entregado_a_guor',
] as const;

export type EtapaConfeccionDb = (typeof ETAPAS_CONFECCION)[number];

export const ETAPA_CONFECCION_INICIAL: EtapaConfeccionDb = 'recepcion_cortes';

export const ETAPA_CONFECCION_LABELS: Record<EtapaConfeccionDb, string> = {
  recepcion_cortes: 'Recepción de cortes',
  confeccion_y_remalle: 'Confección y remalle',
  acabado_y_limpieza: 'Acabado y limpieza',
  planchado_y_empaque: 'Planchado y empaque',
  entregado_a_guor: 'Entregado a GUOR',
};

export function labelEtapaConfeccion(etapa: string | null | undefined): string {
  if (!etapa) return '—';
  return ETAPA_CONFECCION_LABELS[etapa as EtapaConfeccionDb] ?? etapa.replace(/_/g, ' ');
}

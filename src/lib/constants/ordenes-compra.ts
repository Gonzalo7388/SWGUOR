/** Tasa IGV Perú — solo cálculo visual en formulario (no persiste en BD) */
export const TASA_IGV_PEN = 0.18;

export const TIPO_IMPUESTO_OC = {
  IGV: 'igv',
  SIN_IGV: 'sin_igv',
} as const;

export type TipoImpuestoOc = (typeof TIPO_IMPUESTO_OC)[keyof typeof TIPO_IMPUESTO_OC];

export const LABEL_TIPO_IMPUESTO_OC: Record<TipoImpuestoOc, string> = {
  igv: 'IGV 18%',
  sin_igv: 'Sin IGV',
};

/** Puntaje mínimo para considerar match de catálogo (0–100) */
export const MIN_SCORE_MATCH_CATALOGO_OC = 40;

/** MOQ por defecto cuando el producto no define uno en catálogo o carrito legacy. */
export const MOQ_COTIZACION_GLOBAL = 400;

export const MOQ_COMPRA_DEFAULT = MOQ_COTIZACION_GLOBAL;

/** Normaliza MOQ desde BD, JSON persistido o ítems legacy. */
export function resolveCartMoq(moq: unknown): number {
  const n = Number(moq);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : MOQ_COMPRA_DEFAULT;
}

/** Origen en BD para solicitudes de cotización del cliente (sin MOQ global). */
export const ORIGEN_COTIZACION_SOLICITUD = 'solicitud_cliente';

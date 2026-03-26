/**
 * Utilidades de formateo para el ERP B2B - GUOR
 * Manejo de estándares peruanos (RUC, Moneda, Pesos)
 */

/**
 * Formatea un número a moneda peruana (Soles)
 * @example 1250.5 => S/ 1,250.50
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'S/ 0.00';
  
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea un número de RUC con guiones para legibilidad
 * @example 20123456789 => 20-12345678-9
 */
export const formatRUC = (ruc: string | number): string => {
  const s = String(ruc).replace(/\D/g, '');
  if (s.length !== 11) return s;
  return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10)}`;
};

/**
 * Formatea cantidades con unidades de medida (kg, m, unidades)
 * @example (500, 'unidades') => 500 und
 */
export const formatQuantity = (qty: number, unit: string = 'und'): string => {
  const unitMap: Record<string, string> = {
    unidades: 'und',
    kilogramos: 'kg',
    metros: 'm',
    docenas: 'doc',
    set: 'set'
  };
  
  const label = unitMap[unit.toLowerCase()] || unit;
  return `${new Intl.NumberFormat('es-PE').format(qty)} ${label}`;
};

/**
 * Formatea fechas para documentos oficiales (Cotizaciones/Facturas)
 * @example 2026-03-25 => 25 de marzo, 2026
 */
export const formatDateLong = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Genera el correlativo visual para documentos
 * @example (125, 'COT') => COT-000125
 */
export const formatDocumentNumber = (num: number, prefix: string): string => {
  return `${prefix}-${String(num).padStart(6, '0')}`;
};

/**
 * Calcula y formatea el porcentaje de descuento para la UI
 * @example 0.05 => 5%
 */
export const formatDiscountLabel = (discount: number): string => {
  return `${Math.round(discount * 100)}%`;
};
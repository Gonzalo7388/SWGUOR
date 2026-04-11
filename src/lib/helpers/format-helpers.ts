/**
 * Utilidades de formateo para el ERP B2B - GUOR
 * Manejo de estándares peruanos (RUC, Moneda, Pesos)
 */

/**
 * Formatea un número a moneda peruana (Soles)
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return 'S/ 0.00';
  
  // Convertimos a número por si viene como string desde la DB (Decimal/Numeric)
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return 'S/ 0.00';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formatea un número de RUC con guiones
 * Ajustado para manejar BigInt o Strings largos sin errores
 */
export const formatRUC = (ruc: string | number | bigint | null | undefined): string => {
  if (!ruc) return '-';
  const s = String(ruc).replace(/\D/g, '');
  if (s.length !== 11) return s;
  return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10)}`;
};

/**
 * Formatea cantidades con unidades de medida
 */
export const formatQuantity = (qty: number | string, unit: string = 'unidades'): string => {
  const numericQty = typeof qty === 'string' ? parseFloat(qty) : qty;
  
  const unitMap: Record<string, string> = {
    unidades: 'und',
    kilogramos: 'kg',
    metros: 'm',
    docenas: 'doc',
    set: 'set',
    conos: 'conos' // Añadido según tu nuevo Enum de insumos
  };
  
  const label = unitMap[unit.toLowerCase()] || unit;
  return `${new Intl.NumberFormat('es-PE').format(numericQty)} ${label}`;
};

/**
 * Formatea fechas (Documentos Oficiales)
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';

  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Genera el correlativo visual para documentos
 * Ajustado para IDs que pueden venir como String/UUID o BigInt
 */
export const formatDocumentNumber = (num: string | number, prefix: string): string => {
  // Si es un UUID, solo mostramos los primeros 8 caracteres como referencia
  if (typeof num === 'string' && num.includes('-')) {
    return `${prefix}-${num.split('-')[0].toUpperCase()}`;
  }
  return `${prefix}-${String(num).padStart(6, '0')}`;
};

/**
 * Calcula y formatea el porcentaje de descuento
 */
export const formatDiscountLabel = (discount: number | string): string => {
  const d = typeof discount === 'string' ? parseFloat(discount) : discount;
  return `${Math.round(d * (d < 1 ? 100 : 1))}%`; // Maneja tanto 0.05 como 5
};
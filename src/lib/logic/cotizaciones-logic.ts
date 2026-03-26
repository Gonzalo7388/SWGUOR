import { REGLAS_NEGOCIO } from '../constants/estados';

interface ItemCotizacion {
  precioBase: number;
  cantidad: number;
}

/**
 * Nueva función exportada para que la IA consulte 
 * rápidamente la escala de descuentos sin calcular todo.
 */
export const getEscalaPorCantidad = (cantidad: number) => {
  const regla = [...REGLAS_NEGOCIO.ESCALAS_DESCUENTO]
    .reverse()
    .find(r => cantidad >= r.min);
    
  return {
    pct: (regla ? regla.dcto : 0) * 100,
    minimoSiguiente: REGLAS_NEGOCIO.ESCALAS_DESCUENTO.find(r => r.min > cantidad)?.min || null
  };
};

export const calcularTotalesCotizacion = (items: ItemCotizacion[]) => {
  // 1. Calcular Subtotal Bruto
  const subtotalBruto = items.reduce((acc, item) => acc + (item.precioBase * item.cantidad), 0);
  
  // 2. Determinar cantidad total para aplicar escala
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);
  
  // 3. Obtener el descuento correspondiente usando la nueva función
  const escala = getEscalaPorCantidad(cantidadTotal);
    
  const porcentajeDescuento = escala.pct / 100;
  const montoDescuento = subtotalBruto * porcentajeDescuento;
  
  // 4. Cálculos finales
  const subtotalConDescuento = subtotalBruto - montoDescuento;
  const igv = subtotalConDescuento * 0.18;
  const total = subtotalConDescuento + igv;

  return {
    subtotalBruto,
    cantidadTotal,
    porcentajeDescuento: escala.pct, // Retorna el valor entero (ej. 5)
    montoDescuento,
    subtotalConDescuento,
    igv,
    total,
    cumpleMOQ: cantidadTotal >= REGLAS_NEGOCIO.MOQ_GENERAL
  };
};
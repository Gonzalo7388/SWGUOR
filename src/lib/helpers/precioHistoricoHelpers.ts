import { PrecioHistorico } from '@/lib/schemas/precioHistoricoSchema';

export const precioHistoricoHelpers = {
  calcularVariacion: (actual: PrecioHistorico): number =>
    ((actual.precioNuevo - actual.precioAnterior) / actual.precioAnterior) * 100,

  esAumento: (historico: PrecioHistorico): boolean =>
    historico.precioNuevo > historico.precioAnterior,

  obtenerPrecioPromedio: (precios: PrecioHistorico[]): number => {
    if (precios.length === 0) return 0;
    return precios.reduce((sum, p) => sum + p.precioNuevo, 0) / precios.length;
  },

  obtenerPrecioMaximo: (precios: PrecioHistorico[]): PrecioHistorico | undefined =>
    precios.reduce((prev, curr) => curr.precioNuevo > prev.precioNuevo ? curr : prev),

  obtenerPrecioMinimo: (precios: PrecioHistorico[]): PrecioHistorico | undefined =>
    precios.reduce((prev, curr) => curr.precioNuevo < prev.precioNuevo ? curr : prev),

  agruparPorRazon: (precios: PrecioHistorico[]) =>
    precios.reduce((acc, curr) => {
      if (!acc[curr.razonCambio]) acc[curr.razonCambio] = [];
      acc[curr.razonCambio].push(curr);
      return acc;
    }, {} as Record<string, PrecioHistorico[]>),

  obtenerTrendencia: (precios: PrecioHistorico[]): 'SUBIDA' | 'BAJADA' | 'ESTABLE' => {
    if (precios.length < 2) return 'ESTABLE';
    const ultimos = precios.slice(0, 3);
    const subidas = ultimos.filter((_, i) => i > 0 && precioHistoricoHelpers.esAumento(ultimos[i])).length;
    if (subidas >= 2) return 'SUBIDA';
    if (subidas === 0) return 'BAJADA';
    return 'ESTABLE';
  },

  formatearPrecio: (precio: number, moneda: string = 'PEN'): string => {
    const simbolo = { PEN: 'S/', USD: '$', EUR: '€' }[moneda] || moneda;
    return `${simbolo} ${precio.toFixed(2)}`;
  },
};

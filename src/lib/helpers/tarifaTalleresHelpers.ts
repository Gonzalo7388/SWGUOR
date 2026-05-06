import { TarifaTaller } from '@/lib/schemas/tarifaTalleresSchema';

export const tarifaTalleresHelpers = {
  estaVigente: (tarifa: TarifaTaller): boolean => {
    const ahora = new Date();
    const desdeOk = ahora >= tarifa.vigenciaDesde;
    const hastaOk = !tarifa.vigenciaHasta || ahora <= tarifa.vigenciaHasta;
    return desdeOk && hastaOk;
  },

  estaActivaYVigente: (tarifa: TarifaTaller): boolean =>
    tarifa.activo && tarifaTalleresHelpers.estaVigente(tarifa),

  calcularCostoTotal: (tarifa: TarifaTaller, cantidad: number): number =>
    tarifa.precioUnitario * cantidad,

  agruparPorTipo: (tarifas: TarifaTaller[]) =>
    tarifas.reduce((acc, curr) => {
      if (!acc[curr.tipoServicio]) acc[curr.tipoServicio] = [];
      acc[curr.tipoServicio].push(curr);
      return acc;
    }, {} as Record<string, TarifaTaller[]>),

  agruparPorTaller: (tarifas: TarifaTaller[]) =>
    tarifas.reduce((acc, curr) => {
      if (!acc[curr.tallerId]) acc[curr.tallerId] = [];
      acc[curr.tallerId].push(curr);
      return acc;
    }, {} as Record<string, TarifaTaller[]>),

  obtenerMasBarata: (tarifas: TarifaTaller[]): TarifaTaller | undefined =>
    tarifas.reduce((prev, curr) => curr.precioUnitario < prev.precioUnitario ? curr : prev),

  obtenerMasCara: (tarifas: TarifaTaller[]): TarifaTaller | undefined =>
    tarifas.reduce((prev, curr) => curr.precioUnitario > prev.precioUnitario ? curr : prev),

  obtenerTarifasPorTipo: (tarifas: TarifaTaller[], tipo: string) =>
    tarifas.filter(t => t.tipoServicio === tipo && tarifaTalleresHelpers.estaActivaYVigente(t)),

  calcularDuracionEstimada: (tarifa: TarifaTaller, cantidad: number): string | null => {
    if (!tarifa.tiempoEstimado) return null;
    const totalMinutos = tarifa.tiempoEstimado * cantidad;
    const unidad = tarifa.unidadTiempo || 'MINUTOS';
    
    if (unidad === 'MINUTOS') {
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      return `${horas}h ${minutos}m`;
    }
    return `${totalMinutos} ${unidad}`;
  },
};

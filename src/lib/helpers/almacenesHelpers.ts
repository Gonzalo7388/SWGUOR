import { Almacen } from '@/lib/schemas/almacenesSchema';

export const almacenesHelpers = {
  calcularPorcentajeCapacidad: (almacen: Almacen): number =>
    (almacen.capacidadUsada / almacen.capacidadMaxima) * 100,

  obtenerDisponible: (almacen: Almacen): number =>
    almacen.capacidadMaxima - almacen.capacidadUsada,

  estaAlertaCritica: (almacen: Almacen): boolean => {
    const porcentaje = (almacen.capacidadUsada / almacen.capacidadMaxima) * 100;
    return porcentaje >= 90;
  },

  estaLlenoAlmacen: (almacen: Almacen): boolean =>
    almacen.capacidadUsada >= almacen.capacidadMaxima,

  obtenerEstadoCapacidad: (almacen: Almacen): 'VACIO' | 'BAJO' | 'NORMAL' | 'ALTO' | 'LLENO' => {
    const porcentaje = (almacen.capacidadUsada / almacen.capacidadMaxima) * 100;
    if (porcentaje === 0) return 'VACIO';
    if (porcentaje < 30) return 'BAJO';
    if (porcentaje < 70) return 'NORMAL';
    if (porcentaje < 90) return 'ALTO';
    return 'LLENO';
  },

  agruparPorTipo: (almacenes: Almacen[]) =>
    almacenes.reduce((acc, curr) => {
      if (!acc[curr.tipoAlmacen]) acc[curr.tipoAlmacen] = [];
      acc[curr.tipoAlmacen].push(curr);
      return acc;
    }, {} as Record<string, Almacen[]>),

  agruparPorCiudad: (almacenes: Almacen[]) =>
    almacenes.reduce((acc, curr) => {
      if (!acc[curr.ciudad]) acc[curr.ciudad] = [];
      acc[curr.ciudad].push(curr);
      return acc;
    }, {} as Record<string, Almacen[]>),

  filtrarActivos: (almacenes: Almacen[]) => almacenes.filter(a => a.activo),

  obtenerAlmacenConMayorCapacidad: (almacenes: Almacen[]): Almacen | undefined =>
    almacenes.reduce((prev, curr) => 
      almacenesHelpers.obtenerDisponible(curr) > almacenesHelpers.obtenerDisponible(prev) ? curr : prev
    ),
};

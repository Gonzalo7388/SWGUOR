// lib/helpers/almacenes.helpers.ts

import type { Almacen } from '@/lib/schemas/almacenes';

export const almacenesHelpers = {

  // estado es string en Almacen ('activo' | 'inactivo')
  estaActivo: (almacen: Almacen): boolean =>
    almacen.estado === 'activo',

  // Devuelve la capacidad máxima configurada (no el disponible — eso requiere el stock)
  obtenerCapacidadTotal: (almacen: Almacen): number =>
    Number(almacen.capacidad_total ?? 0),

  // Calcula disponible a partir de la capacidad y lo usado (viene del service)
  calcularDisponible: (almacen: Almacen, cantidadUsada: number): number => {
    const total = Number(almacen.capacidad_total ?? 0);
    return Math.max(total - cantidadUsada, 0);
  },

  calcularPorcentajeUso: (almacen: Almacen, cantidadUsada: number): number => {
    const total = Number(almacen.capacidad_total ?? 0);
    if (total === 0) return 0;
    return Math.min((cantidadUsada / total) * 100, 100);
  },

  estaEnCapacidadCritica: (almacen: Almacen, cantidadUsada: number, umbral = 90): boolean => {
    return almacenesHelpers.calcularPorcentajeUso(almacen, cantidadUsada) >= umbral;
  },

  // agrupa por string 'activo'
  agruparPorEstado: (almacenes: Almacen[]): { activos: Almacen[]; inactivos: Almacen[] } =>
    almacenes.reduce(
      (acc, curr) => {
        const activo = curr.estado === 'activo';
        if (activo) acc.activos.push(curr);
        else acc.inactivos.push(curr);
        return acc;
      },
      { activos: [] as Almacen[], inactivos: [] as Almacen[] }
    ),

  obtenerAlmacenConMayorCapacidad: (almacenes: Almacen[]): Almacen | undefined => {
    if (almacenes.length === 0) return undefined;
    return almacenes.reduce((prev, curr) => {
      const currCap = Number(curr.capacidad_total ?? 0);
      const prevCap = Number(prev.capacidad_total ?? 0);
      return currCap > prevCap ? curr : prev;
    });
  },

  tieneDatosContacto: (almacen: Almacen): boolean =>
    !!(almacen.telefono || almacen.email),

  formatearNombre: (almacen: Almacen): string =>
    `${almacen.nombre}${almacen.descripcion ? ` — ${almacen.descripcion}` : ''}`,
};
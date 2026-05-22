'use server';

import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import {
  mapFiltrosMovimientosToListar,
  type FiltrosMovimientosInput,
} from '@/lib/helpers/movimientos-filtros.helper';
import { MovimientosInventarioService } from '@/lib/services/movimientos-inventario.service';
import type { TipoMovimiento } from '@prisma/client';

const ROLES: RolUsuario[] = ['administrador', 'gerente', 'almacenero'];

export type ObtenerMovimientosResult =
  | { success: true; data: Awaited<ReturnType<typeof MovimientosInventarioService.listarDesdeFiltros>> }
  | { success: false; error: string; data: [] };

export type ObtenerEstadisticasMovimientosResult =
  | {
      success: true;
      data: Awaited<ReturnType<typeof MovimientosInventarioService.obtenerResumen>>;
    }
  | { success: false; error: string; data: null };

/**
 * Lista movimientos de inventario desde Prisma con filtros del UI.
 * - search / busqueda: nombre producto, insumo o material (+ motivo)
 * - tipo_movimiento: entrada | salida | ajuste
 * - fecha_inicio / fecha_fin (o desde / hasta) sobre created_at
 * - Sin filtros: últimos 50 registros
 */
export async function obtenerMovimientos(
  filtros: FiltrosMovimientosInput = {},
): Promise<ObtenerMovimientosResult> {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) {
    return { success: false, error: 'Sin permisos para consultar movimientos', data: [] };
  }

  try {
    const data = await MovimientosInventarioService.listarDesdeFiltros(filtros);
    return { success: true, data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error al cargar movimientos';
    console.error('[obtenerMovimientos]', e);
    return { success: false, error: message, data: [] };
  }
}

/** Estadísticas agregadas respetando rango de fechas del filtro */
export async function obtenerEstadisticasMovimientos(
  filtros: FiltrosMovimientosInput = {},
): Promise<ObtenerEstadisticasMovimientosResult> {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) {
    return { success: false, error: 'Sin permisos', data: null };
  }

  try {
    const mapped = mapFiltrosMovimientosToListar(filtros);
    const data = await MovimientosInventarioService.obtenerResumen({
      desde: mapped.desde,
      hasta: mapped.hasta,
      tipo_movimiento: mapped.tipo_movimiento as TipoMovimiento | undefined,
    });
    return { success: true, data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error al cargar estadísticas';
    console.error('[obtenerEstadisticasMovimientos]', e);
    return { success: false, error: message, data: null };
  }
}

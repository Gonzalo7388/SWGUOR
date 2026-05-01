'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMovimientos, fetchResumenMovimientos } from '@/lib/helpers/movimientos-inventario-helpers';
import type { TipoMovimiento, ReferenciaMovimiento } from '@prisma/client';

export const MOVIMIENTOS_KEY = 'movimientos_inventario';
export const RESUMEN_MOVIMIENTOS_KEY = 'resumen_movimientos';

/**
 * Hook para consumir movimientos de inventario con filtros
 */
export function useMovimientos(params?: {
  tipo_movimiento?: TipoMovimiento;
  referencia_tipo?: ReferenciaMovimiento;
  producto_id?: string;
  material_id?: string;
  insumo_id?: string;
  busqueda?: string;
  desde?: Date;
  hasta?: Date;
  limite?: number;
  autoRefresh?: boolean; // Refrescar automáticamente
}) {
  const query = useQuery({
    queryKey: [MOVIMIENTOS_KEY, params],
    queryFn: () => fetchMovimientos(params),
    refetchOnWindowFocus: params?.autoRefresh ?? false,
    refetchInterval: params?.autoRefresh ? 30000 : undefined, // 30s si está habilitado
  });

  return {
    movimientos: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener resumen de movimientos (estadísticas)
 */
export function useResumenMovimientos(params?: {
  tipo_movimiento?: TipoMovimiento;
  desde?: Date;
  hasta?: Date;
}) {
  const query = useQuery({
    queryKey: [RESUMEN_MOVIMIENTOS_KEY, params],
    queryFn: () => fetchResumenMovimientos(params),
    refetchOnWindowFocus: false,
  });

  return {
    resumen: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para invalidar cache de movimientos
 * Se usa después de registrar un movimiento
 */
export function useInvalidarMovimientos() {
  const queryClient = useQueryClient();

  return {
    invalidar: () => {
      queryClient.invalidateQueries({ queryKey: [MOVIMIENTOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [RESUMEN_MOVIMIENTOS_KEY] });
    },
  };
}

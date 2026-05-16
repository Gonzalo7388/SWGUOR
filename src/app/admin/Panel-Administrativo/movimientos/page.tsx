'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import {
  MovimientosTable,
  MovimientosFilters,
  EstadisticasMovimientos,
  ExportarMovimientos,
  type Movimiento,
  type MovimientosFiltersState,
  type EstadisticasMovimientosType,
} from '@/components/admin/movimientos';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';

const ESTADISTICAS_INICIALES: EstadisticasMovimientosType = {
  totalEntradas: 0,
  totalSalidas: 0,
  totalAjustes: 0,
  totalMovimientos: 0,
  montoTotalEntradas: 0,
  montoTotalSalidas: 0,
};

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasMovimientosType>(
    ESTADISTICAS_INICIALES
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MovimientosFiltersState>({});

  const buildDateParams = useCallback(
    (params: URLSearchParams) => {
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);
    },
    [filters.desde, filters.hasta]
  );

  const loadMovimientos = useCallback(async () => {
    const queryParams = new URLSearchParams();
    buildDateParams(queryParams);
    if (filters.tipoMovimiento)
      queryParams.append('tipo_movimiento', filters.tipoMovimiento);
    if (filters.referenciaMovimiento)
      queryParams.append('referencia_tipo', filters.referenciaMovimiento);
    if (filters.tipoItem) queryParams.append('tipoItem', filters.tipoItem);
    if (filters.busqueda) queryParams.append('busqueda', filters.busqueda);

    const response = await fetch(
      `/api/admin/movimientos-inventario?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Error al cargar movimientos');

    const data = await response.json();
    setMovimientos(data.data ?? []);
  }, [filters, buildDateParams]);

  const loadEstadisticas = useCallback(async () => {
    const queryParams = new URLSearchParams();
    buildDateParams(queryParams);

    const response = await fetch(
      `/api/admin/movimientos-inventario/resumen?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Error al cargar estadísticas');

    const data = await response.json();
    setEstadisticas(data.data ?? ESTADISTICAS_INICIALES);
  }, [filters.desde, filters.hasta, buildDateParams]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadMovimientos(), loadEstadisticas()]);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar los datos');
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadMovimientos, loadEstadisticas]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((mov) => {
      if (!filters.busqueda) return true;

      const searchLower = filters.busqueda.toLowerCase();
      const itemName =
        mov.productos?.nombre || mov.insumo?.nombre || mov.materiales?.nombre || '';
      const motivo = mov.motivo || '';

      return (
        itemName.toLowerCase().includes(searchLower) ||
        motivo.toLowerCase().includes(searchLower)
      );
    });
  }, [movimientos, filters.busqueda]);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Movimientos de Inventario"
          description="Registro y seguimiento detallado de entradas, salidas y ajustes de stock"
          actionLabel="Actualizar"
          onAction={loadAll}
          icon={RefreshCw}
        />

        <EstadisticasMovimientos
          estadisticas={estadisticas}
          isLoading={isLoading}
        />

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <MovimientosFilters onFilterChange={setFilters} />
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <p className="text-xs text-slate-400 font-medium">
              Mostrando <span className="text-slate-900 font-bold">{filteredMovimientos.length}</span> registros
            </p>
            <ExportarMovimientos
              movimientos={filteredMovimientos}
              titulo="Movimientos_Inventario"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[400px]">
             <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest animate-pulse text-xs">Sincronizando Inventario...</p>
          </div>
        ) : (
          <MovimientosTable movimientos={filteredMovimientos} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MovimientosTable,
  MovimientosFilters,
  EstadisticasMovimientos,
  ExportarMovimientos,
  type Movimiento,
  type MovimientosFiltersState,
  type EstadisticasMovimientosType,
} from "@/components/admin/movimientos";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const ESTADISTICAS_INICIALES: EstadisticasMovimientosType = {
  totalEntradas: 0,
  totalSalidas: 0,
  totalAjustes: 0,
  totalMovimientos: 0,
  montoTotalEntradas: 0,
  montoTotalSalidas: 0,
};

export function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasMovimientosType>(
    ESTADISTICAS_INICIALES
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MovimientosFiltersState>({});

  // ── Helpers ──────────────────────────────────────────────────────────────

  const buildDateParams = useCallback(
    (params: URLSearchParams) => {
      if (filters.desde) params.append("desde", filters.desde);
      if (filters.hasta) params.append("hasta", filters.hasta);
    },
    [filters.desde, filters.hasta]
  );

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const loadMovimientos = useCallback(async () => {
    const queryParams = new URLSearchParams();
    buildDateParams(queryParams);
    if (filters.tipoMovimiento)
      queryParams.append("tipo", filters.tipoMovimiento);
    if (filters.referenciaMovimiento)
      queryParams.append("referencia", filters.referenciaMovimiento);
    if (filters.tipoItem) queryParams.append("tipoItem", filters.tipoItem);

    const response = await fetch(
      `/api/admin/inventario/movimientos?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error("Error al cargar movimientos");

    const data = await response.json();
    setMovimientos(data.data ?? []);
  }, [filters, buildDateParams]);

  const loadEstadisticas = useCallback(async () => {
    const queryParams = new URLSearchParams();
    buildDateParams(queryParams);

    const response = await fetch(
      `/api/admin/inventario/movimientos/estadisticas?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error("Error al cargar estadísticas");

    const data = await response.json();
    setEstadisticas(data.data ?? ESTADISTICAS_INICIALES);
  }, [filters.desde, filters.hasta, buildDateParams]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadMovimientos(), loadEstadisticas()]);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar los datos");
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadMovimientos, loadEstadisticas]);

  // ── Efectos ───────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Filtrado en cliente (solo búsqueda de texto en tiempo real) ───────────

  const filteredMovimientos = movimientos.filter((mov) => {
    if (!filters.busqueda) return true;

    const searchLower = filters.busqueda.toLowerCase();
    const itemName =
      mov.producto?.nombre || mov.insumo?.nombre || mov.material?.nombre || "";
    const motivo = mov.motivo || "";

    return (
      itemName.toLowerCase().includes(searchLower) ||
      motivo.toLowerCase().includes(searchLower)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimientos de Inventario</h1>
          <p className="text-gray-600 mt-2">
            Registra y visualiza todos los movimientos de inventario del sistema
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAll}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <EstadisticasMovimientos
        estadisticas={estadisticas}
        isLoading={isLoading}
      />

      {/* Filtros */}
      <MovimientosFilters onFilterChange={setFilters} />

      {/* Exportar */}
      <div className="flex justify-end">
        <ExportarMovimientos
          movimientos={filteredMovimientos}
          titulo="Movimientos_Inventario"
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-96" />
        </div>
      ) : (
        <MovimientosTable movimientos={filteredMovimientos} />
      )}
    </div>
  );
}
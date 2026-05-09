"use client";

import { useMemo, useState, useEffect } from "react";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { Button } from "@/components/ui/button";
import {
  Plus, RefreshCw, ClipboardList,
  Timer, CheckCircle2
} from "lucide-react";
import dynamic from "next/dynamic";
import StatCard from "@/components/admin/produccion/StatCard";
import OrdenFilters from "@/components/admin/produccion/OrdenFilters";
import OrdenesSkeleton from "@/components/admin/produccion/OrdenSkeleton";
import OrdenesTable from "@/components/admin/produccion/OrdenesTable";

// Imports Dinámicos
const OrdenFormDialog = dynamic(() => import("@/components/admin/produccion/OrdenFormDialog"));
const OrdenDetalleSheet = dynamic(() => import("@/components/admin/produccion/OrdenDetalleSheet"));

export default function OrdenesProduccionPage() {
  // Estados de filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { ordenes, meta, isLoading, refetch } = useOrdenesProduccion({
    search: debouncedSearch,
    etapa: etapaFilter,
    page,
    limit,
  });

  // Estados para Diálogos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<any>(null);

  // Estadísticas para StatCards (NOTA: Esto ahora refleja el total de la base de datos)
  const stats = useMemo(() => ({
    total: meta.total,
    // Idealmente, esto también vendría del backend si quieres números precisos
    enProceso: activeFilter === 'costura' ? meta.total : 0,
    completadas: activeFilter === 'entrega' ? meta.total : 0,
  }), [meta.total, activeFilter]);

  // SI ESTÁ CARGANDO, MUESTRA TODA LA ESTRUCTURA SKELETON
  if (isLoading && ordenes.length === 0) {
    return <OrdenesSkeleton />;
  }

  return (
    <div className="p-6 space-y-7 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Producción</h1>
          <p className="text-slate-500 text-sm">Seguimiento de fabricación y control de talleres.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-10 border-slate-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => { setSelectedOrden(null); setIsFormOpen(true); }}
            className="bg-rose-600 hover:bg-rose-700 h-10 shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva Orden
          </Button>
        </div>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Órdenes" value={stats.total} icon={<ClipboardList />} color="pink"
          isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')}
        />
        <StatCard
          title="En Costura" value={stats.enProceso} icon={<Timer />} color="orange"
          isActive={activeFilter === 'costura'} onClick={() => setActiveFilter('costura')}
        />
        <StatCard
          title="Entregadas" value={stats.completadas} icon={<CheckCircle2 />} color="emerald"
          isActive={activeFilter === 'entrega'} onClick={() => setActiveFilter('entrega')}
        />
      </div>

      {/* Filtros Integrados */}
      <OrdenFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        etapaFilter={etapaFilter}
        onEtapaChange={setEtapaFilter}
        onClear={() => {
          setSearchTerm("");
          setEtapaFilter("all");
        }}
      />

      {/* Tabla de Ordenes de Producción */}
      <OrdenesTable
        data={ordenes}
        onView={(orden) => { setSelectedOrden(orden); setIsSheetOpen(true); }}
        onEdit={(orden) => { setSelectedOrden(orden); setIsFormOpen(true); }}
      />

      {/* Paginación */}
      {!isLoading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500">
            Mostrando página <span className="font-bold text-slate-900">{meta.page}</span> de <span className="font-bold text-slate-900">{meta.totalPages}</span>
            {' '} ({meta.total} registros totales)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={meta.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page === meta.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Componentes de Interacción */}
      <OrdenFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedOrden}
      />

      <OrdenDetalleSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        orden={selectedOrden}
      />
    </div>
  );
}

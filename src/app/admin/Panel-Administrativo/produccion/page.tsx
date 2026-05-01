"use client";

import { useMemo, useState } from "react";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, RefreshCw, ClipboardList, 
  Timer, CheckCircle2} from "lucide-react";
import dynamic from "next/dynamic";
import StatCard from "@/components/admin/produccion/StatCard";
import OrdenFilters from "@/components/admin/produccion/OrdenFilters";
import OrdenesSkeleton from "@/components/admin/produccion/OrdenSkeleton";
import OrdenesTable from "@/components/admin/produccion/OrdenesTable";

// Imports Dinámicos
const OrdenFormDialog = dynamic(() => import("@/components/admin/produccion/OrdenFormDialog"));
const OrdenDetalleSheet = dynamic(() => import("@/components/admin/produccion/OrdenDetalleSheet"));

export default function OrdenesProduccionPage() {
  const { ordenes, isLoading, refetch } = useOrdenesProduccion();

  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Estados para Diálogos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<any>(null);

// Lógica de filtrado (Memoized para rendimiento)
  const filteredData = useMemo(() => {
    return ordenes.filter((o: any) => {
      const matchSearch = 
        o.productos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.talleres?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString().includes(searchTerm);
      
      const etapaActual = o.seguimiento_produccion?.[0]?.etapa || 'pendiente';
      const matchEtapa = etapaFilter === "all" || etapaActual === etapaFilter;
      
      return matchSearch && matchEtapa;
    });
  }, [ordenes, searchTerm, etapaFilter]);

   // Estadísticas para StatCards
  const stats = useMemo(() => ({
    total: ordenes.length,
    enProceso: ordenes.filter((o: any) => o.seguimiento_produccion?.[0]?.etapa === 'costura').length,
    completadas: ordenes.filter((o: any) => o.seguimiento_produccion?.[0]?.etapa === 'entrega').length,
  }), [ordenes]);

  // SI ESTÁ CARGANDO, MUESTRA TODA LA ESTRUCTURA SKELETON
  if (isLoading) {
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
        data={filteredData}
        onView={(orden) => { setSelectedOrden(orden); setIsSheetOpen(true); }}
        onEdit={(orden) => { setSelectedOrden(orden); setIsFormOpen(true); }}
      />

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

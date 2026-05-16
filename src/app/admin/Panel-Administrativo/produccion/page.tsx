'use client';

import { useMemo, useState, useEffect } from 'react';
import { useOrdenesProduccion } from '@/lib/hooks/useOrdenProduccion';
import { Button } from '@/components/ui/button';
import {
  Plus, RefreshCw, ClipboardList,
  Timer, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import StatCard from '@/components/admin/common/StatCard';
import OrdenFilters from '@/components/admin/produccion/OrdenFilters';
import OrdenesSkeleton from '@/components/admin/produccion/OrdenSkeleton';
import OrdenesTable from '@/components/admin/produccion/OrdenesTable';

// Imports Dinámicos
const OrdenFormDialog = dynamic(() => import('@/components/admin/produccion/OrdenFormDialog'));
const OrdenDetalleSheet = dynamic(() => import('@/components/admin/produccion/OrdenDetalleSheet'));

export default function OrdenesProduccionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [etapaFilter, setEtapaFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { ordenes, meta, isLoading, refetch } = useOrdenesProduccion({
    search: debouncedSearch,
    etapa: etapaFilter,
    page,
    limit,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<any>(null);

  const stats = useMemo(() => ({
    total: meta.total,
    enProceso: etapaFilter === 'costura' ? meta.total : (meta as any).enProceso ?? 0,
    completadas: etapaFilter === 'entrega' ? meta.total : (meta as any).completadas ?? 0,
  }), [meta, etapaFilter]);

  if (isLoading && ordenes.length === 0) {
    return <OrdenesSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Producción"
          description="Seguimiento de fabricación y control de talleres en tiempo real"
          actionLabel="Nueva Orden"
          onAction={() => { setSelectedOrden(null); setIsFormOpen(true); }}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Órdenes"
            value={stats.total}
            icon={ClipboardList}
            color="pink"
            isActive={activeFilter === 'all'}
            onClick={() => { setActiveFilter('all'); setEtapaFilter('all'); }}
          />
          <StatCard
            title="En Costura"
            value={stats.enProceso}
            icon={Timer}
            color="orange"
            isActive={activeFilter === 'costura'}
            onClick={() => { setActiveFilter('costura'); setEtapaFilter('costura'); }}
          />
          <StatCard
            title="Completadas"
            value={stats.completadas}
            icon={CheckCircle2}
            color="emerald"
            isActive={activeFilter === 'entrega'}
            onClick={() => { setActiveFilter('entrega'); setEtapaFilter('entrega'); }}
          />
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <OrdenFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            etapaFilter={etapaFilter}
            onEtapaChange={setEtapaFilter}
            onClear={() => {
              setSearchTerm('');
              setEtapaFilter('all');
              setActiveFilter('all');
            }}
          />
        </div>

        {/* Tabla */}
        <OrdenesTable
          data={ordenes}
          onView={(orden) => { setSelectedOrden(orden); setIsSheetOpen(true); }}
          onEdit={(orden) => { setSelectedOrden(orden); setIsFormOpen(true); }}
        />

        {/* Paginación */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-slate-500">
              Página <span className="font-bold text-slate-900">{meta.page}</span> de <span className="font-bold text-slate-900">{meta.totalPages}</span>
              {' '} ({meta.total} registros)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                className="rounded-xl"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="sm"
                className="rounded-xl"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page === meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
    </div>
  );
}

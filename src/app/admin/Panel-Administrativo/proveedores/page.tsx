'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, Plus, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useProveedores } from '@/lib/hooks/useProveedores';
import ProveedorTable from '@/components/admin/proveedores/ProveedorTable';
import ProveedorFormModal from '@/components/admin/proveedores/ProveedorFormModal';
import { ProveedorDeleteModal, ProveedorDetailModal } from '@/components/admin/proveedores/ProveedorModals';
import type { Proveedor, ProveedorForm, EstadoProveedor } from '@/lib/schemas/proveedor';

const PAGE_SIZE = 15;

export default function ProveedoresPage() {
  const { can, isLoading: authLoading } = usePermissions();

  // ── UI state ───────────────────────────────────────────────
  const [page,              setPage]             = useState(1);
  const [busqueda,          setBusqueda]         = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [estadoFilter,      setEstadoFilter]     = useState<EstadoProveedor>('');
  const [showForm,          setShowForm]         = useState(false);
  const [editingProveedor,  setEditingProveedor] = useState<Proveedor | null>(null);
  const [deleteTarget,      setDeleteTarget]     = useState<Proveedor | null>(null);
  const [detailTarget,      setDetailTarget]     = useState<Proveedor | null>(null);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // ── Data ───────────────────────────────────────────────────
  const {
    proveedores, pagination, isLoading, refetch,
    save, deactivate, isSaving, isDeactivating,
  } = useProveedores({
    page,
    limit:        PAGE_SIZE,
    busqueda:     debouncedBusqueda,
    estadoFilter,
    editingId:    editingProveedor?.id,
  });

  // ── Permisos ───────────────────────────────────────────────
  const canView   = can('view',   'proveedores');
  const canCreate = can('create', 'proveedores') || can('edit', 'proveedores');
  const canDelete = can('delete', 'proveedores');

  // ── Handlers ──────────────────────────────────────────────
  const handleNew = () => { setEditingProveedor(null); setShowForm(true); };

  const handleEdit = (p: Proveedor) => { setEditingProveedor(p); setShowForm(true); };

  const handleDelete = (p: Proveedor) => {
    if (p.estado === 'inactivo') { toast.info('Este proveedor ya está desactivado'); return; }
    setDeleteTarget(p);
  };

  const handleSave = (data: ProveedorForm) => {
    save({ ...data, id: editingProveedor?.id });
    setShowForm(false);
    setEditingProveedor(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deactivate(deleteTarget.id!);
      setDeleteTarget(null);
    }
  };

  // ── Guards ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg font-semibold">No tienes permisos para ver esta sección</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-xl">
              <Building2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-500 text-sm">Gestión de abastecimiento y suministros</p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={handleNew}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2 h-11 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Agregar Proveedor
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="TOTAL"     value={pagination?.total ?? 0}                                          color="rose"    isActive={!estadoFilter}              onClick={() => { setEstadoFilter('');         setPage(1); }} />
          <StatCard label="ACTIVOS"   value={proveedores.filter((p) => p.estado === 'activo').length}         color="emerald" isActive={estadoFilter === 'activo'}   onClick={() => { setEstadoFilter('activo');   setPage(1); }} />
          <StatCard label="INACTIVOS" value={proveedores.filter((p) => p.estado === 'inactivo').length}       color="orange"  isActive={estadoFilter === 'inactivo'} onClick={() => { setEstadoFilter('inactivo'); setPage(1); }} />
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por razón social o RUC..."
              className="pl-10 h-11 border-gray-200 focus:ring-rose-500"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
            />
          </div>
          <Button variant="outline" className="h-11 border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 ${isLoading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando proveedores...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ProveedorTable
              data={proveedores}
              canEdit={canCreate}
              canDelete={canDelete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetail={setDetailTarget}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-xs text-gray-500">
                  Mostrando <span className="font-bold text-gray-900">{proveedores.length}</span> de{' '}
                  <span className="font-bold text-gray-900">{pagination.total}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                    Página {page} de {pagination.totalPages}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <ProveedorFormModal
          proveedor={editingProveedor}
          isSaving={isSaving}
          onClose={() => { setShowForm(false); setEditingProveedor(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ProveedorDeleteModal
          proveedor={deleteTarget}
          isDeleting={isDeactivating}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {detailTarget && (
        <ProveedorDetailModal
          proveedor={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, isActive, onClick }: {
  label: string; value: number; color: string; isActive: boolean; onClick: () => void;
}) {
  const colorMap: Record<string, { border: string; ring: string; text: string; bg: string; iconBg: string }> = {
    rose:    { border: 'border-rose-500',    ring: 'ring-rose-50',    text: 'text-rose-600',    bg: 'bg-rose-50',    iconBg: 'bg-rose-600'    },
    emerald: { border: 'border-emerald-500', ring: 'ring-emerald-50', text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-600' },
    orange:  { border: 'border-orange-500',  ring: 'ring-orange-50',  text: 'text-orange-600',  bg: 'bg-orange-50',  iconBg: 'bg-orange-600'  },
  };
  const c = colorMap[color] ?? colorMap.rose;

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
        isActive
          ? `${c.border} ring-4 shadow-xl scale-[1.02] z-10 ${c.bg}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-2 rounded-lg transition-all ${isActive ? `${c.iconBg} text-white rotate-3` : 'bg-gray-100 text-gray-600'}`}>
        <Building2 className="w-5 h-5" />
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? c.text : 'text-gray-800'}`}>{value}</p>
      </div>
    </button>
  );
}
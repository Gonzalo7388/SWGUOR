'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Scissors, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { toast }  from 'sonner';
import { usePermissions } from '@/lib/hooks/usePermissions';
import ConfeccionesTable  from '@/components/admin/confecciones/ConfeccionesTable';
import ConfeccionesStats  from '@/components/admin/confecciones/ConfeccionesStats';
import { NuevaOrdenModal } from '@/components/admin/confecciones/NuevaOrdenModal';
import { ESTADO_CONFECCION, ESTADO_LABELS } from '@/lib/schemas/confecciones';
import type { ConfeccionRow_T } from '@/components/admin/confecciones/ConfeccionesTable';

type Taller = { id: number; nombre: string };
const PAGE_SIZE = 10;

export default function ConfeccionesPage() {
  const { can, isLoading: authLoading } = usePermissions();

  const [confecciones,  setConfecciones]  = useState<ConfeccionRow_T[]>([]);
  const [talleres,      setTalleres]      = useState<Taller[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [filtroEstado,  setFiltroEstado]  = useState('todos');
  const [busqueda,      setBusqueda]      = useState('');
  const [currentPage,   setCurrentPage]   = useState(0);
  const [statusFilter,  setStatusFilter]  = useState<string | null>(null);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedBusqueda(busqueda); setCurrentPage(0); }, 500);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (filtroEstado !== 'todos') q.set('estado', filtroEstado);
      if (statusFilter) q.set('statusFilter', statusFilter);
      if (debouncedBusqueda) q.set('search', debouncedBusqueda);
      q.set('page', (currentPage + 1).toString());
      q.set('limit', PAGE_SIZE.toString());

      const [confRes, tallerRes] = await Promise.all([
        fetch(`/api/admin/confecciones?${q.toString()}`),
        fetch('/api/admin/talleres'),
      ]);
      if (!confRes.ok || !tallerRes.ok) throw new Error('Error al obtener datos');

      const [confData, tallerData] = await Promise.all([confRes.json(), tallerRes.json()]);
      setConfecciones(confData.data);
      setTalleres(tallerData.data);
      setMeta({ total: confData.meta?.total || 0, page: confData.meta?.page || 1, totalPages: confData.meta?.totalPages || 1 });
    } catch {
      toast.error('Error al cargar las órdenes de confección.');
    } finally {
      setIsLoading(false);
    }
  }, [filtroEstado, statusFilter, debouncedBusqueda, currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(0); }, [filtroEstado, statusFilter]);

  const canCreate = can('create', 'confecciones') || can('edit', 'confecciones');

  const stats = useMemo(() => ({
    total:       meta.total,
    activas:     statusFilter === 'activas'     ? meta.total : 0,
    urgentes:    statusFilter === 'urgentes'    ? meta.total : 0,
    completadas: statusFilter === 'completadas' ? meta.total : 0,
  }), [meta.total, statusFilter]);

  async function handleEstadoChange(id: number, nuevoEstado: ConfeccionRow_T['estado']) {
    try {
      const res = await fetch(`/api/admin/confecciones/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Estado actualizado a "${ESTADO_LABELS[nuevoEstado]}"`);
      fetchData();
    } catch {
      toast.error('Error al actualizar el estado.');
    }
  }

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 rounded-xl">
              <Scissors className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Confecciones</h1>
              <p className="text-gray-500 text-sm">Gestión de producción con talleres externos</p>
            </div>
          </div>
          {canCreate && (
            <Button onClick={() => setModalOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white font-semibold gap-2 h-11 active:scale-95">
              <Plus className="w-4 h-4" /> Nueva Orden
            </Button>
          )}
        </div>

        <ConfeccionesStats
          stats={stats}
          statusFilter={statusFilter}
          onFilterChange={(f) => { setStatusFilter(f); setCurrentPage(0); }}
        />

        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por prenda, taller, pedido o ID..."
              className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(0); }}
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(0); }}
            className="h-11 px-4 border border-gray-200 rounded-xl text-[11px] font-black uppercase bg-white cursor-pointer hover:border-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="todos">Todos los estados</option>
            {ESTADO_CONFECCION.map((e) => (
              <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
            ))}
          </select>
          <Button variant="outline" className="h-11 border-gray-200" onClick={fetchData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-4">
          <ConfeccionesTable data={confecciones} isLoading={isLoading} onEstadoChange={handleEstadoChange} />

          {!isLoading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{confecciones.length}</span> de{' '}
                <span className="font-bold text-gray-900">{meta.total}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ChevronLeft className="w-4 h-4" /></Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">Página {currentPage + 1} de {meta.totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= meta.totalPages}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NuevaOrdenModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        talleres={talleres}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
      />
    </div>
  );
}
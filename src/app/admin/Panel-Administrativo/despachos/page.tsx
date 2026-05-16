'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Truck, Clock, MapPin, CheckCircle2, Search, RefreshCw, XCircle, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import StatCard from '@/components/admin/common/StatCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Despacho {
  id: number;
  despacho_id: string;
  pedido_id: string;
  cliente: string;
  direccion: string;
  estado: 'preparando' | 'en_ruta' | 'entregado' | 'incidencia';
  tracking: string;
  fecha_despacho: string;
  fecha_entrega: string;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  preparando: { label: 'Preparando', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  en_ruta:    { label: 'En Ruta',    color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: Truck },
  entregado:  { label: 'Entregado',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  incidencia: { label: 'Incidencia', color: 'bg-red-100 text-red-700 border-red-200',       icon: XCircle },
};

export default function DespachosPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const canView = can('view', 'despachos');

  const cargarDatos = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/despachos`);
      if (!response.ok) throw new Error('Error al cargar despachos');
      const { data } = await response.json();
      
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        despacho_id: item.despacho_id,
        pedido_id: String(item.pedido_id),
        cliente: item.cliente,
        direccion: item.direccion,
        estado: item.estado,
        tracking: item.tracking || 'S/N',
        fecha_despacho: item.fecha_despacho ? new Date(item.fecha_despacho).toLocaleDateString('es-PE') : '---',
        fecha_entrega: item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString('es-PE') : 'Pendiente'
      }));

      setDespachos(datosFormateados);
    } catch (error) {
      toast.error('No se pudieron sincronizar los despachos');
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    if (!authLoading) cargarDatos();
  }, [authLoading, cargarDatos]);

  const filtered = useMemo(() => {
    return despachos.filter((d) => {
      const matchesEstado = filtroEstado === 'todos' || d.estado === filtroEstado;
      const matchesSearch = 
        d.despacho_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tracking.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEstado && matchesSearch;
    });
  }, [despachos, filtroEstado, searchTerm]);

  const stats = useMemo(() => ({
    total: despachos.length,
    preparando: despachos.filter(d => d.estado === 'preparando').length,
    transito: despachos.filter(d => d.estado === 'en_ruta').length,
    entregados: despachos.filter(d => d.estado === 'entregado').length,
  }), [despachos]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  if (authLoading) return <LoadingSpinner />;
  if (!canView) return <AccessDenied />;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Gestión de Despachos"
          description="Monitoreo de logística y última milla en tiempo real"
          actionLabel="Nuevo Despacho"
          onAction={undefined} // Deshabilitado si no hay ruta de creación
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Envíos"
            value={stats.total}
            icon={Truck}
            color="slate"
            isActive={filtroEstado === 'todos'}
            onClick={() => { setFiltroEstado('todos'); setCurrentPage(0); }}
          />
          <StatCard
            title="Preparando"
            value={stats.preparando}
            icon={Clock}
            color="orange"
            isActive={filtroEstado === 'preparando'}
            onClick={() => { setFiltroEstado('preparando'); setCurrentPage(0); }}
          />
          <StatCard
            title="En Ruta"
            value={stats.transito}
            icon={MapPin}
            color="blue"
            isActive={filtroEstado === 'en_ruta'}
            onClick={() => { setFiltroEstado('en_ruta'); setCurrentPage(0); }}
          />
          <StatCard
            title="Entregados"
            value={stats.entregados}
            icon={CheckCircle2}
            color="emerald"
            isActive={filtroEstado === 'entregado'}
            onClick={() => { setFiltroEstado('entregado'); setCurrentPage(0); }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por despacho, cliente o tracking..."
              className="pl-10 h-11 bg-white border-gray-200 rounded-xl"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
            />
          </div>
          <Button variant="outline" className="h-11 rounded-xl border-gray-200" onClick={cargarDatos}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Despacho</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Dirección</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking</th>
                <th className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-5 h-16 bg-gray-50/50"></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="w-8 h-8 text-gray-300" />
                      <span className="text-gray-400 italic text-sm">No se encontraron despachos</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((desp) => {
                  const est = ESTADO_CONFIG[desp.estado] ?? { label: desp.estado, color: 'bg-gray-100 text-gray-600', icon: Clock };
                  const EstIcon = est.icon;
                  return (
                    <tr key={desp.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                            {desp.despacho_id}
                          </span>
                          <span className="text-[10px] text-slate-400">Pedido #{desp.pedido_id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 text-sm font-medium">{desp.cliente}</td>
                      <td className="py-4 px-5 text-slate-500 text-xs max-w-[200px] truncate hidden md:table-cell">{desp.direccion}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${est.color}`}>
                          <EstIcon className="w-3 h-3" />
                          {est.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-xs font-mono">{desp.tracking}</td>
                      <td className="py-4 px-5 text-slate-700 text-sm font-medium">{desp.fecha_entrega}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">
            Mostrando <span className="font-bold text-gray-900">{paginated.length}</span> de <span className="font-bold text-gray-900">{filtered.length}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-xl flex items-center">
              Página {currentPage + 1} de {totalPages || 1}
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-black uppercase tracking-widest animate-pulse">Sincronizando Logística...</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50 text-center p-6">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acceso Restringido</h2>
      <p className="text-slate-500 max-w-sm mt-2">No cuentas con los permisos necesarios para visualizar el módulo de logística.</p>
    </div>
  );
}
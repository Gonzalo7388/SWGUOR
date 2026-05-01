'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Plus, Search, RefreshCw, DollarSign,
  CheckCircle2, AlertTriangle, Calendar,
  ChevronLeft, ChevronRight, XCircle, FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportCotizacionesToPDF } from '@/lib/utils/export-utils';
import { exportToExcel } from '@/lib/utils/export-utils';
import { CotizacionesService } from '@/lib/services/cotizaciones-services';
import type { CotizacionRow } from '@/lib/services/cotizaciones-services';
import { CotizacionActions } from '@/components/admin/cotizaciones/CotizacionActions';
import Link from 'next/link';

const PAGE_SIZE = 10;

type EstadoFiltro = string | null;

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones]   = useState<CotizacionRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [estadoFiltro, setEstadoFiltro]   = useState<EstadoFiltro>(null);
  const [currentPage, setCurrentPage]     = useState(0);

  const [stats, setStats] = useState({
    pendientes:  0,
    aprobadas:   0,
    expiradas:   0,
    totalValor:  0,
  });

  // ── Carga de datos ────────────────────────────────────────────────────────
  const loadCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cotizaciones', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar cotizaciones');
      const json = await res.json();
      const data: CotizacionRow[] = json.data ?? json;

      setCotizaciones(data);
      setStats({
        pendientes: data.filter((c) => c.estado === 'borrador' || c.estado === 'enviada').length,
        aprobadas:  data.filter((c) => c.estado === 'aprobada' || c.estado === 'convertida').length,
        expiradas:  data.filter((c) => c.estado === 'expirada').length,
        totalValor: data
          .filter((c) => c.estado !== 'rechazada' && c.estado !== 'expirada')
          .reduce((sum, c) => sum + c.monto, 0),
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCotizaciones(); }, [loadCotizaciones]);

  // ── Filtrado y paginación ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return cotizaciones.filter((c) => {
      const matchSearch =
        c.cotizacion_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cliente ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.descripcion ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = estadoFiltro === null || c.estado === estadoFiltro;
      return matchSearch && matchEstado;
    });
  }, [cotizaciones, searchTerm, estadoFiltro]);

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated    = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const resetPage = () => setCurrentPage(0);

  // ── Exportar ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (filtered.length === 0) return toast.error('No hay datos para exportar');
    const toastId = toast.loading('Preparando PDF...');
    try {
      await exportCotizacionesToPDF(filtered, {
        title:    'REPORTE DE COTIZACIONES',
        filename: `Cotizaciones_GUOR_${new Date().toISOString().split('T')[0]}`,
      });
      toast.success('PDF generado correctamente', { id: toastId });
    } catch {
      toast.error('Error al generar el PDF', { id: toastId });
    }
  };

  const handleExportExcel = () => {
    if (filtered.length === 0) return toast.error('No hay datos para exportar');
    const data = filtered.map((c) => ({
      'N° Cotización':  c.cotizacion_id,
      'Cliente':        c.cliente ?? '---',
      'Monto (S/.)':    c.monto,
      'Estado':         c.estado.toUpperCase(),
      'Vencimiento':    c.fecha_vencimiento,
      'Creación':       c.fecha_creacion,
      'Descripción':    c.descripcion ?? '---',
    }));
    exportToExcel(data, {
      filename:  `Cotizaciones_GUOR_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Cotizaciones',
    });
    toast.success('Excel generado correctamente');
  };

  // ── Badge ─────────────────────────────────────────────────────────────────
  const getEstadoBadge = (estado: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      borrador:   { bg: 'bg-slate-100',   text: 'text-slate-600',   label: 'Borrador'   },
      enviada:    { bg: 'bg-yellow-100',  text: 'text-yellow-700',  label: 'Enviada'    },
      aprobada:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprobada'   },
      convertida: { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Convertida' },
      rechazada:  { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rechazada'  },
      expirada:   { bg: 'bg-orange-100',  text: 'text-orange-700',  label: 'Expirada'   },
    };
    return map[estado] ?? map.borrador;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
            <p className="text-gray-500 text-sm">Gestión de propuestas comerciales de Modas y Estilos GUOR</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>

            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>

            <Link href="/admin/Panel-Administrativo/cotizaciones/nueva">
              <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Nueva Cotización
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats / Filtros rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="PENDIENTES"
            value={stats.pendientes}
            icon={<Calendar className="w-6 h-6" />}
            color="yellow"
            isActive={estadoFiltro === 'enviada'}
            onClick={() => { setEstadoFiltro(estadoFiltro === 'enviada' ? null : 'enviada'); resetPage(); }}
          />
          <StatCard
            title="APROBADAS"
            value={stats.aprobadas}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="emerald"
            isActive={estadoFiltro === 'aprobada'}
            onClick={() => { setEstadoFiltro(estadoFiltro === 'aprobada' ? null : 'aprobada'); resetPage(); }}
          />
          <StatCard
            title="EXPIRADAS"
            value={stats.expiradas}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
            isActive={estadoFiltro === 'expirada'}
            onClick={() => { setEstadoFiltro(estadoFiltro === 'expirada' ? null : 'expirada'); resetPage(); }}
          />
          <StatCard
            title="VALOR ACTIVO"
            value={`S/ ${stats.totalValor.toLocaleString('es-PE')}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
            isActive={false}
            onClick={() => {}}
          />
        </div>

        {/* Buscador + filtro estado */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por número, cliente o descripción..."
              className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
            />
          </div>

          <select
            value={estadoFiltro ?? 'todos'}
            onChange={(e) => { setEstadoFiltro(e.target.value === 'todos' ? null : e.target.value); resetPage(); }}
            className="h-11 px-4 border border-gray-200 rounded-lg text-xs font-bold uppercase bg-white cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviada">Enviada</option>
            <option value="aprobada">Aprobada</option>
            <option value="convertida">Convertida</option>
            <option value="rechazada">Rechazada</option>
            <option value="expirada">Expirada</option>
          </select>

          <Button variant="outline" className="h-11 border-gray-200" onClick={loadCotizaciones}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando cotizaciones...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Cotización</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Cliente</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Descripción</th>
                    <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Monto</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Estado</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Vencimiento</th>
                    <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-semibold">
                        No hay cotizaciones
                      </td>
                    </tr>
                  ) : paginated.map((cot) => {
                    const badge      = getEstadoBadge(cot.estado);
                    const isExpirada = cot.estado === 'expirada';
                    return (
                      <tr
                        key={cot.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isExpirada ? 'bg-orange-50/40' : ''}`}
                      >
                        <td className="py-4 px-4 font-bold text-gray-900 text-sm">{cot.cotizacion_id}</td>
                        <td className="py-4 px-4 text-gray-700 text-sm">{cot.cliente ?? '—'}</td>
                        <td className="py-4 px-4 text-gray-500 text-sm max-w-xs truncate">{cot.descripcion ?? '—'}</td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 text-sm">
                          S/ {cot.monto.toLocaleString('es-PE')}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {cot.fecha_vencimiento}
                          {isExpirada && (
                            <span className="ml-2 text-[10px] text-orange-600 font-bold uppercase">(Vencida)</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {['borrador', 'enviada'].includes(cot.estado) ? (
                            <CotizacionActions
                              cotizacionId={cot.id}
                              estado={cot.estado}
                              validaHasta={cot.fecha_vencimiento}
                              onSuccess={loadCotizaciones}
                            />
                          ) : (
                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">
                              Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{paginated.length}</span> de{' '}
                <span className="font-bold text-gray-900">{filtered.length}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage + 1 >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatCard (igual al de Categorías) ─────────────────────────────────────────
function StatCard({
  title, value, icon, isActive, color, onClick,
}: {
  title: string; value: string | number; icon: React.ReactNode;
  isActive: boolean; color: string; onClick: () => void;
}) {
  const styles: Record<string, { active: string; iconActive: string; textActive: string }> = {
    yellow:  { active: 'border-yellow-400 ring-yellow-50 bg-white',  iconActive: 'bg-yellow-500 text-white',  textActive: 'text-yellow-600'  },
    emerald: { active: 'border-emerald-500 ring-emerald-50 bg-white', iconActive: 'bg-emerald-600 text-white', textActive: 'text-emerald-600' },
    orange:  { active: 'border-orange-500 ring-orange-50 bg-white',  iconActive: 'bg-orange-600 text-white',  textActive: 'text-orange-600'  },
    blue:    { active: 'border-blue-500 ring-blue-50 bg-white',      iconActive: 'bg-blue-600 text-white',    textActive: 'text-blue-600'    },
  };
  const s = styles[color];

  return (
    <button
      onClick={onClick}
      className={`group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer w-full ${
        isActive
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${s.active}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-3 rounded-lg transition-all duration-300 ${isActive ? `${s.iconActive} rotate-3` : 'bg-gray-100 text-gray-600 group-hover:rotate-3'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${isActive ? s.textActive : 'text-gray-800'}`}>{value}</p>
      </div>
    </button>
  );
}
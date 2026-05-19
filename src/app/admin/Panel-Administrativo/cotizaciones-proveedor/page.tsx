'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Plus, Search, RefreshCw, DollarSign,
  CheckCircle2, Clock, Calendar,
  ChevronLeft, ChevronRight, FileSpreadsheet, Eye,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import StatCard from '@/components/admin/common/StatCard';
import Link from 'next/link';

const PAGE_SIZE = 10;

interface CotizacionProv {
  id: string;
  numero_cotizacion: string;
  proveedor_nombre: string;
  proveedor_ruc: string;
  monto: number;
  moneda: string;
  fecha_cotizacion: string;
  fecha_vencimiento: string;
  estado: string;
}

const ESTADO_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  aprobada: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprobada' },
  rechazada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazada' },
};

export default function CotizacionesProveedorPage() {
  const [data, setData] = useState<CotizacionProv[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cotizaciones-proveedor');
      if (!res.ok) throw new Error('Error al cargar datos');
      const json = await res.json();
      setData(json.data ?? json);
    } catch (err: any) {
      toast.error('Error al cargar cotizaciones de proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    return data.filter((c) =>
      c.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_cotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.proveedor_ruc?.includes(searchTerm)
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      montoTotal: data.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0),
      pendientes: data.filter(c => c.estado === 'pendiente').length
    };
  }, [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <AdminPageHeader
            title="Cotizaciones Proveedor"
            description="Registro y seguimiento de propuestas recibidas de proveedores"
            actionLabel="Nueva Cotización"
            onAction={() => { window.location.href = '/admin/Panel-Administrativo/cotizaciones-proveedor/nueva'; }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Recibidas"
            value={stats.total}
            icon={FileText}
            color="slate"
          />
          <StatCard
            title="Pendientes Revisión"
            value={stats.pendientes}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Monto Acumulado"
            value={`S/ ${stats.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="emerald"
            disabled
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por proveedor, RUC o N° cotización..."
              className="pl-10 h-11 bg-white border-gray-200 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 rounded-xl border-gray-200" onClick={loadData}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 border-b border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                  <th className="text-left py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">N° Cotización</th>
                  <th className="text-right py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monto</th>
                  <th className="text-left py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th className="text-left py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="text-center py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-8 h-8 text-gray-300" />
                        <span className="text-gray-400 italic text-sm">No hay registros</span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((cot) => {
                  const badge = ESTADO_BADGE[cot.estado] ?? ESTADO_BADGE.pendiente;
                  return (
                    <tr key={cot.id} className="group border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{cot.proveedor_nombre}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">RUC: {cot.proveedor_ruc}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-sm font-medium">{cot.numero_cotizacion || '—'}</td>
                      <td className="py-4 px-5 text-right font-bold text-slate-800 text-sm">
                        {cot.moneda === 'USD' ? '$' : 'S/'} {Number(cot.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5 text-slate-500 text-xs">
                        {new Date(cot.fecha_cotizacion).toLocaleDateString('es-PE')}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">
            Página <span className="font-bold text-gray-900">{currentPage + 1}</span> de {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

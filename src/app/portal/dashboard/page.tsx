'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Plus, ArrowRight, FileText, ShoppingBag, 
  Truck, Calendar, Bell, User, ChevronRight
} from 'lucide-react';
import { usePortal } from '../_contexts/PortalContext';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';

interface CotizacionReciente {
  id: number;
  numero: string;
  total: number;
  estado: string;
  created_at: string;
  total_items: number;
}

export default function DashboardPage() {
  const { cliente, stats } = usePortal();
  const [recientes, setRecientes] = useState<CotizacionReciente[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!cliente) return;
    const fetch = async () => {
      const { data } = await getSupabaseBrowserClient()
        .from('cotizaciones')
        .select('id, numero, total, estado, created_at, cotizacion_items(count)')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(5);

        setRecientes((data ?? []).map((c: any) => ({
            ...c, 
            total_items: c.cotizacion_items?.?.count ?? 0, 
          })));
      setLoadingData(false);
    };
    fetch();
  }, [cliente]);

  const KPIs = [
    { label: 'Cotizaciones', value: stats.cotizaciones_activas, sub: 'Pendientes de cierre', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Órdenes', value: stats.ordenes_activas, sub: 'En producción', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'En Ruta', value: stats.despachos_en_ruta, sub: 'Próximas entregas', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header con Perfil (CUS_36) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hola, {cliente?.razon_social.split(' ')} 👋
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Calendar size={14} />
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Bloque de Perfil Rápido */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">RUC: {cliente?.ruc}</p>
            <p className="text-xs font-bold text-slate-900">{cliente?.razon_social}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Contenido Principal (KPIs y Tabla) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KPIs.map((kpi) => (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl transition-colors", kpi.bg, kpi.color)}>
                    <kpi.icon size={22} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 leading-none">{kpi.value}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla de Actividad Reciente */}
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Actividad Reciente</h2>
                <p className="text-[11px] text-slate-400 font-bold mt-1">Últimos movimientos de cotizaciones</p>
              </div>
              <Link href="/portal/cotizaciones" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 group">
                Historial completo 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
{/* Tabla de Actividad Reciente Reconstruida con CUS_28 */}
          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronizando...</span>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/20">
                    <th className="px-8 py-4 text-left">Documento</th>
                    <th className="px-8 py-4 text-left">Total</th>
                    <th className="px-8 py-4 text-left">Estado</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recientes.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900 tracking-tight">{c.numero}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDateLong(c.created_at)}</p>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">{formatCurrency(c.total)}</td>
                      <td className="px-8 py-5">
                        <EstadoBadge estado={c.estado} tipo="cotizacion" />
                      </td>
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                        
                        {/* BOTÓN CUS_28: EXPORTAR PDF */}
                        <button 
                          onClick={() => window.print()} 
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                          title="Exportar a PDF"
                        >
                          <FileText size={16} />
                        </button>

                        <Link href={`/portal/cotizaciones/${c.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>          </div>
        </div>

        {/* 2. Barra Lateral de Notificaciones (CUS_36) */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="animate-bounce" />
              <h2 className="font-black text-xs uppercase tracking-widest">Avisos del Sistema</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-700/50 p-4 rounded-2xl border border-blue-400/30">
                <p className="text-xs font-bold">Logística:</p>
                <p className="text-[11px] text-blue-100 mt-1">Tienes {stats.despachos_en_ruta} despachos en ruta hacia tu dirección principal.</p>
              </div>
              <Link 
                href="/portal/despachos"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Rastrear Envíos
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accesos Rápidos</h2>
            <div className="space-y-2">
              <Link href="/portal/cotizaciones/nueva" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-xs font-bold text-slate-700">Nueva Cotización</span>
                <Plus size={14} className="text-slate-400 group-hover:text-blue-600" />
              </Link>
              <Link href="/portal/perfil" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group border-t border-slate-50">
                <span className="text-xs font-bold text-slate-700">Configurar Perfil</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

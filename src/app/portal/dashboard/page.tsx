'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import {
  Plus, ArrowUpRight, FileText, ShoppingBag,
  Truck, TrendingUp, Clock, CheckCircle2,
  AlertCircle, RefreshCw, Package, Layers,
  ChevronRight, Sparkles, Circle,
} from 'lucide-react';

import { usePortal } from '../_contexts/PortalContext';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';
import type { EstadoCotizacion, EstadoPedido }  from '@prisma/client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CotizacionReciente {
  id: number;
  numero: string;
  total: number | null;
  estado: EstadoCotizacion;
  created_at: string;
  total_items: number;
  moneda: string;
}

interface PedidoReciente {
  id: number;
  estado: EstadoPedido;
  total: number;
  created_at: string;
  total_unidades: number;
  moneda: string;
}

interface DashboardStats {
  cotizaciones_pendientes: number;
  pedidos_en_produccion: number;
  pedidos_listos: number;
  despachos_en_ruta: number;
  total_gastado: number;
}

interface DashboardData {
  cotizaciones: CotizacionReciente[];
  pedidos: PedidoReciente[];
  stats: DashboardStats;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Pulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-100', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <Pulse className="h-6 w-32 rounded-full" />
          <Pulse className="h-16 w-80 rounded-2xl" />
        </div>
        <Pulse className="h-16 w-48 rounded-[2rem]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-40 rounded-[2.5rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Pulse className="lg:col-span-2 h-[500px] rounded-[3rem]" />
        <Pulse className="h-[500px] rounded-[3rem]" />
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { cliente } = usePortal();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!cliente) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const [
        { data: cotizacionesRaw, error: eCot },
        { data: pedidosRaw,      error: ePed },
        { data: cotStats,        error: eCotS },
        { data: pedStats,        error: ePedS },
      ] = await Promise.all([
        supabase
          .from('cotizaciones')
          .select('id, numero, total, estado, created_at, moneda, cotizacion_items(count)')
          .eq('cliente_id', cliente.id)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('pedidos')
          .select('id, estado, total, created_at, total_unidades, moneda')
          .eq('cliente_id', cliente.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('cotizaciones')
          .select('estado')
          .eq('cliente_id', cliente.id),
        supabase
          .from('pedidos')
          .select('estado, total')
          .eq('cliente_id', cliente.id),
      ]);

      if (eCot)  throw eCot;
      if (ePed)  throw ePed;
      if (eCotS) throw eCotS;
      if (ePedS) throw ePedS;

      const pedidoIds = (pedidosRaw ?? []).map((p: any) => p.id).filter(Boolean);
      const { count: despachosCount } = pedidoIds.length > 0
        ? await supabase
            .from('despachos')
            .select('id', { count: 'exact', head: true })
            .eq('estado', 'en_ruta')
            .in('pedido_id', pedidoIds)
        : { count: 0 };

      const cots = cotStats ?? [];
      const peds = pedStats ?? [];

      setData({
        cotizaciones: (cotizacionesRaw ?? []).map((c: any) => ({
          ...c,
          total_items: c.cotizacion_items?.[0]?.count ?? 0,
        })),
        pedidos: (pedidosRaw ?? []).map((p: any) => ({
          ...p,
          estado:        p.estado        ?? 'pendiente',
          created_at:    p.created_at    ?? '',
        })),
        stats: {
          cotizaciones_pendientes: cots.filter((c: any) =>
            ['borrador', 'enviada'].includes(c.estado),
          ).length,
          pedidos_en_produccion: peds.filter((p: any) => p.estado === 'en_produccion').length,
          pedidos_listos:        peds.filter((p: any) => p.estado === 'listo_para_despacho').length,
          despachos_en_ruta:     despachosCount ?? 0,
          total_gastado:         peds
            .filter((p: any) => p.estado === 'entregado' || p.estado === 'completado')
            .reduce((acc: number, p: any) => acc + Number(p.total ?? 0), 0),
        },
      });
    } catch (err: unknown) {
      setError('No se pudo cargar la información.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [cliente]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <AlertCircle size={48} className="text-rose-200" />
        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{error}</p>
        <button onClick={fetchData} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Reintentar</button>
      </div>
    );
  }

  const s = data?.stats;
  const primerNombre = cliente?.razon_social?.split(' ')[0] ?? 'Cliente';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const KPIS = [
    { label: 'Cotizaciones',   value: s?.cotizaciones_pendientes ?? 0, sub: 'Pendientes de cierre', icon: FileText,     href: '/portal/cotizaciones' },
    { label: 'En producción',  value: s?.pedidos_en_produccion   ?? 0, sub: 'Órdenes activas',      icon: Layers,        href: '/portal/pedidos'      },
    { label: 'Listos',         value: s?.pedidos_listos          ?? 0, sub: 'Para despacho',        icon: CheckCircle2,  href: '/portal/pedidos'      },
    { label: 'En ruta',        value: s?.despachos_en_ruta       ?? 0, sub: 'Entregas en camino',   icon: Truck,         href: '/portal/despachos'    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-100">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
            <Sparkles size={12} className="text-[#d4af37]" />
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em]">{saludo}</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Hola, <span className="text-[#d4af37]">{primerNombre}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="hidden lg:flex flex-col items-end justify-center px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inversión Total</span>
             <span className="text-2xl font-black text-slate-900">{formatCurrency(s?.total_gastado ?? 0)}</span>
          </div>
          <Link
            href="/portal/cotizaciones/nueva"
            className="flex items-center gap-3 px-8 py-5 bg-[#0f172a] text-[#d4af37] rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi) => (
          <Link 
            key={kpi.label} 
            href={kpi.href}
            className="group relative bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <kpi.icon size={80} />
            </div>
            <div className="relative z-10 space-y-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#d4af37] group-hover:text-white transition-colors duration-500">
                  <kpi.icon size={20} />
               </div>
               <div>
                  <h3 className="text-4xl font-black text-slate-900 leading-none">{kpi.value}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
                  <p className="text-[10px] font-bold text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity mt-2">{kpi.sub}</p>
               </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Grid principal ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cotizaciones — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Cotizaciones Recientes</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestione sus presupuestos activos</p>
                </div>
                <Link href="/portal/cotizaciones" className="text-xs font-black text-[#d4af37] uppercase hover:underline">Ver todas</Link>
              </div>

              {(data?.cotizaciones.length ?? 0) > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        {['Documento', 'Total', 'Estado', ''].map(h => (
                          <th key={h} className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data!.cotizaciones.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">{c.numero}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDateLong(c.created_at)}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-slate-900">{formatCurrency(c.total ?? 0)}</span>
                          </td>
                          <td className="px-8 py-5">
                            <EstadoBadge estado={c.estado} tipo="cotizacion" />
                          </td>
                          <td className="px-8 py-5 text-right">
                             <Link href={`/portal/cotizaciones/${c.id}`} className="text-[#d4af37] hover:scale-110 transition-transform inline-block">
                               <ArrowUpRight size={18} />
                             </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                   <FileText size={48} className="mx-auto text-slate-100" />
                   <p className="text-slate-400 font-bold uppercase text-xs">No hay solicitudes recientes</p>
                </div>
              )}
           </div>
        </div>

        {/* Panel derecho — Pedidos */}
        <div className="space-y-8">
           <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Mis Pedidos</h2>
                <Link href="/portal/pedidos" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#d4af37] hover:text-white transition-all">
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                {(data?.pedidos.length ?? 0) > 0 ? (
                  data!.pedidos.map(p => (
                    <Link key={p.id} href={`/portal/pedidos/${p.id}`} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-[#d4af37] transition-all">
                        <Package size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-slate-900 truncate">Orden #{p.id}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{p.total_unidades} Unidades</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <EstadoBadge estado={p.estado} tipo="pedido" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Package size={32} className="mx-auto text-slate-100" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] mt-2">Sin actividad</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ayuda rápida</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/portal/perfil" className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 transition-colors">
                    <Circle size={8} className="fill-[#d4af37] text-[#d4af37]" /> Perfil
                  </Link>
                  <Link href="/portal/seguimiento-pedido" className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 transition-colors">
                    <Circle size={8} className="fill-[#d4af37] text-[#d4af37]" /> Tracking
                  </Link>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

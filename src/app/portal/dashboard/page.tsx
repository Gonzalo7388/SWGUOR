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
  return <div className={cn('animate-pulse rounded-xl bg-[#e4c28a]/20', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-10 w-52" />
        <Pulse className="h-3 w-36" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Pulse className="lg:col-span-3 h-80 rounded-2xl" />
        <Pulse className="lg:col-span-2 h-80 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, href, index,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  href: string;
  index: number;
}) {
  const isEmpty = value === 0;

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-lg',
        isEmpty
          ? 'bg-white border-[#e4c28a]/20 hover:border-[#e4c28a]/50 hover:shadow-[#e4c28a]/10'
          : 'bg-[#231e1d] border-[#231e1d] hover:border-[#b5854b] hover:shadow-[#b5854b]/20',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300',
            isEmpty
              ? 'bg-[#e4c28a]/20 group-hover:bg-[#b5854b]/10'
              : 'bg-[#b5854b]/20 group-hover:bg-[#b5854b]/40',
          )}
        >
          <Icon
            size={15}
            className={isEmpty ? 'text-[#b5854b]/50' : 'text-[#e4c28a]'}
          />
        </div>
        <ChevronRight
          size={12}
          className={cn(
            'mt-1 transition-all duration-300 group-hover:translate-x-0.5',
            isEmpty ? 'text-[#e4c28a]/30 group-hover:text-[#b5854b]' : 'text-[#e4c28a]/20 group-hover:text-[#e4c28a]/50',
          )}
        />
      </div>

      <div>
        <p
          className={cn(
            'text-4xl font-black leading-none mb-2 tabular-nums transition-colors duration-300',
            isEmpty
              ? 'text-[#231e1d]/20 group-hover:text-[#231e1d]/30'
              : 'text-[#fff4e2] group-hover:text-white',
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            'text-[10px] font-black uppercase tracking-[0.18em] mb-0.5',
            isEmpty ? 'text-[#b5854b]/40' : 'text-[#b5854b]',
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'text-[10px] font-medium',
            isEmpty ? 'text-[#231e1d]/25' : 'text-[#e4c28a]/40',
          )}
        >
          {sub}
        </p>
      </div>
    </Link>
  );
}

// ─── Fila de cotización ────────────────────────────────────────────────────────

function CotizacionRow({ c, index }: { c: CotizacionReciente; index: number }) {
  return (
    <tr className="group border-b border-[#e4c28a]/10 last:border-0 hover:bg-[#e4c28a]/[0.05] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#e4c28a]/15 flex items-center justify-center flex-shrink-0">
            <FileText size={11} className="text-[#b5854b]/70" />
          </div>
          <span className="text-xs font-black text-[#231e1d]">{c.numero}</span>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-[11px] text-[#231e1d]/40 font-medium tabular-nums">
          {formatDateLong(c.created_at)}
        </span>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className="text-[11px] text-[#231e1d]/35 font-bold">
          {c.total_items} ítem{c.total_items !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-black text-[#231e1d] tabular-nums">
          {formatCurrency(c.total ?? 0)}
        </span>
      </td>
      <td className="px-6 py-4">
        <EstadoBadge estado={c.estado} tipo="cotizacion" />
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/portal/cotizaciones/${c.id}`}
          className={cn(
            'inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200',
            'bg-[#e4c28a]/10 text-[#b5854b]/30',
            'group-hover:bg-[#231e1d] group-hover:text-[#e4c28a]',
          )}
        >
          <ArrowUpRight size={13} />
        </Link>
      </td>
    </tr>
  );
}

// ─── Card de pedido ────────────────────────────────────────────────────────────

function PedidoCard({ p }: { p: PedidoReciente }) {
  return (
    <Link
      href={`/portal/pedidos/${p.id}`}
      className={cn(
        'group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200',
        'hover:bg-[#e4c28a]/10 border border-transparent hover:border-[#e4c28a]/25',
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300',
        'bg-[#e4c28a]/15 group-hover:bg-[#231e1d]',
      )}>
        <Package
          size={14}
          className="text-[#b5854b]/60 group-hover:text-[#e4c28a] transition-colors duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-[#231e1d]">Pedido #{p.id}</p>
        <p className="text-[10px] text-[#231e1d]/35 font-medium mt-0.5 truncate">
          {p.total_unidades} unid · {formatDateLong(p.created_at)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <EstadoBadge estado={p.estado} tipo='pedido' />
        <span className="text-[10px] font-black text-[#231e1d]/50 tabular-nums">
          {formatCurrency(p.total)}
        </span> 
      </div>
    </Link>
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
            .filter((p: any) => p.estado === 'entregado')
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#e4c28a]/15 flex items-center justify-center">
          <AlertCircle size={20} className="text-[#b5854b]/50" />
        </div>
        <p className="text-xs font-bold text-[#231e1d]/40">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#231e1d]
                     text-[#e4c28a] text-xs font-bold hover:bg-[#b5854b]
                     hover:text-[#fff4e2] transition-all duration-200"
        >
          <RefreshCw size={12} />
          Reintentar
        </button>
      </div>
    );
  }

  const s = data?.stats;
  const primerNombre = cliente?.razon_social?.split(' ')[0] ?? 'Cliente';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const KPIS = [
    { label: 'Cotizaciones',   value: s?.cotizaciones_pendientes ?? 0, sub: 'Pendientes de cierre', icon: FileText,     href: '/portal/cotizaciones', index: 0 },
    { label: 'En producción',  value: s?.pedidos_en_produccion   ?? 0, sub: 'Órdenes activas',      icon: Layers,        href: '/portal/pedidos',      index: 1 },
    { label: 'Listos',         value: s?.pedidos_listos          ?? 0, sub: 'Para despacho',        icon: CheckCircle2,  href: '/portal/pedidos',      index: 2 },
    { label: 'En ruta',        value: s?.despachos_en_ruta       ?? 0, sub: 'Entregas en camino',   icon: Truck,         href: '/portal/despachos',    index: 3 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">

        <div className="space-y-1.5">
          {/* Saludo pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                          bg-[#e4c28a]/20 border border-[#e4c28a]/30">
            <Sparkles size={10} className="text-[#b5854b]" />
            <span className="text-[10px] font-black text-[#b5854b] uppercase tracking-[0.2em]">
              {saludo}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#231e1d] tracking-tight leading-none">
            {primerNombre}
          </h1>

          <p className="text-xs text-[#231e1d]/35 font-medium">
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {(s?.total_gastado ?? 0) > 0 && (
            <div className="hidden md:flex flex-col items-end gap-0.5
                            px-4 py-3 rounded-xl border border-[#e4c28a]/30 bg-white/60">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={11} className="text-[#b5854b]" />
                <span className="text-xs font-black text-[#231e1d] tabular-nums">
                  {formatCurrency(s!.total_gastado)}
                </span>
              </div>
              <span className="text-[9px] text-[#b5854b]/50 font-bold uppercase tracking-widest">
                total histórico
              </span>
            </div>
          )}

          <Link
            href="/portal/cotizaciones/nueva"
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black',
              'bg-[#231e1d] text-[#e4c28a]',
              'hover:bg-[#b5854b] hover:text-[#fff4e2]',
              'transition-all duration-200 shadow-md shadow-[#231e1d]/10',
              'active:scale-[0.97]',
            )}
          >
            <Plus size={14} />
            Nueva Cotización
          </Link>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {KPIS.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── Grid principal ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Cotizaciones — 3 cols */}
        <div className="lg:col-span-3 bg-white border border-[#e4c28a]/25 rounded-2xl overflow-hidden">

          <div className="px-6 py-5 flex items-center justify-between border-b border-[#e4c28a]/15">
            <div>
              <h2 className="text-[11px] font-black text-[#231e1d] uppercase tracking-[0.18em]">
                Cotizaciones recientes
              </h2>
              <p className="text-[10px] text-[#b5854b]/50 font-medium mt-0.5">
                Últimas 6 solicitudes
              </p>
            </div>
            <Link
              href="/portal/cotizaciones"
              className="group flex items-center gap-1 text-[11px] font-bold
                         text-[#b5854b] hover:text-[#231e1d] transition-colors"
            >
              Ver historial
              <ArrowUpRight
                size={12}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          {(data?.cotizaciones.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#e4c28a]/[0.04]">
                    {['Documento', 'Fecha', 'Ítems', 'Total', 'Estado', ''].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-3 text-left text-[9px] font-black',
                          'text-[#b5854b]/40 uppercase tracking-[0.18em]',
                          h === 'Fecha' && 'hidden md:table-cell',
                          h === 'Ítems' && 'hidden sm:table-cell',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data!.cotizaciones.map((c, i) => (
                    <CotizacionRow key={c.id} c={c} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e4c28a]/10 flex items-center justify-center">
                <FileText size={18} className="text-[#b5854b]/30" />
              </div>
              <p className="text-[11px] font-bold text-[#231e1d]/25 uppercase tracking-widest">
                Sin cotizaciones aún
              </p>
              <Link
                href="/portal/cotizaciones/nueva"
                className="flex items-center gap-1.5 mt-1 text-[11px] font-bold
                           text-[#b5854b] hover:text-[#231e1d] transition-colors"
              >
                <Plus size={12} />
                Crear primera cotización
              </Link>
            </div>
          )}
        </div>

        {/* Panel derecho — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Pedidos */}
          <div className="flex-1 bg-white border border-[#e4c28a]/25 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#e4c28a]/15">
              <div>
                <h2 className="text-[11px] font-black text-[#231e1d] uppercase tracking-[0.18em]">
                  Mis pedidos
                </h2>
                <p className="text-[10px] text-[#b5854b]/50 font-medium mt-0.5">
                  Estado en tiempo real
                </p>
              </div>
              <Link
                href="/portal/pedidos"
                className="group flex items-center gap-1 text-[11px] font-bold
                           text-[#b5854b] hover:text-[#231e1d] transition-colors"
              >
                Ver todos
                <ChevronRight
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>

            <div className="p-3">
              {(data?.pedidos.length ?? 0) > 0 ? (
                <div className="space-y-1">
                  {data!.pedidos.map((p) => (
                    <PedidoCard key={p.id} p={p} />
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#e4c28a]/10 flex items-center justify-center">
                    <ShoppingBag size={16} className="text-[#b5854b]/30" />
                  </div>
                  <p className="text-[10px] font-bold text-[#231e1d]/25 uppercase tracking-widest">
                    Sin pedidos activos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white border border-[#e4c28a]/25 rounded-2xl p-5">
            <p className="text-[10px] font-black text-[#231e1d]/40 uppercase tracking-[0.2em] mb-3">
              Acceso rápido
            </p>
            <div className="space-y-1.5">
              {[
                { href: '/portal/productos',   label: 'Ver catálogo de productos', icon: ShoppingBag },
                { href: '/portal/despachos',   label: 'Seguimiento de entregas',   icon: Truck       },
                { href: '/portal/cotizaciones', label: 'Historial de cotizaciones', icon: FileText   },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center justify-between px-4 py-2.5 rounded-xl',
                    'border border-transparent hover:border-[#e4c28a]/30',
                    'hover:bg-[#e4c28a]/[0.07] transition-all duration-200',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#e4c28a]/15 flex items-center justify-center
                                    group-hover:bg-[#b5854b] transition-colors duration-300">
                      <Icon
                        size={12}
                        className="text-[#b5854b]/70 group-hover:text-[#fff4e2] transition-colors duration-300"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#231e1d]/60
                                     group-hover:text-[#231e1d] transition-colors duration-200">
                      {label}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={12}
                    className="text-[#e4c28a]/30 group-hover:text-[#b5854b]
                               group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                               transition-all duration-200"
                  />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
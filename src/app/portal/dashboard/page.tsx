'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FileText, Truck, CheckCircle2, AlertCircle, Layers, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; // ◄ Importado para tipado estricto

import { usePortal } from '../_contexts/PortalContext';
import { KpiCards } from '@/components/portal/dashboard/KpiCards';
import { RecentQuotes } from '@/components/portal/dashboard/RecentQuotes';
import { RecentOrders } from '@/components/portal/dashboard/RecentOrders';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';
import type { EstadoCotizacion, EstadoPedido } from '@prisma/client';

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

interface KpiItem {
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon; // ◄ Tipado correcto para matchear con tu componente
  href: string;
}

// ─── Skeleton Optimizado (Mismo tamaño que el layout real) ─────────────────────

function Pulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-100/80', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Cabecera Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <Pulse className="h-4 w-24 rounded-full" />
          <Pulse className="h-8 w-64 rounded-xl" />
          <Pulse className="h-3 w-32 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Pulse className="hidden md:block h-12 w-36 rounded-xl" />
          <Pulse className="h-11 w-40 rounded-xl" />
        </div>
      </div>
      {/* KPIs Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      {/* Contenido Principal Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Pulse className="h-[340px] rounded-2xl" />
        </div>
        <div>
          <Pulse className="h-[340px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { cliente } = usePortal();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!cliente) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const [
        { data: cotizacionesRaw, error: eCot },
        { data: pedidosRaw, error: ePed },
        { data: cotStats, error: eCotS },
        { data: pedStats, error: ePedS },
      ] = await Promise.all([
        supabase.from('cotizaciones').select('id, numero, total, estado, created_at, moneda, cotizacion_items(count)').eq('cliente_id', cliente.id).order('created_at', { ascending: false }).limit(6),
        supabase.from('pedidos').select('id, estado, total, created_at, total_unidades, moneda').eq('cliente_id', cliente.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('cotizaciones').select('estado').eq('cliente_id', cliente.id),
        supabase.from('pedidos').select('estado, total').eq('cliente_id', cliente.id),
      ]);

      if (eCot || ePed || eCotS || ePedS) throw eCot || ePed || eCotS || ePedS;

      const pedidoIds = (pedidosRaw ?? []).map((p: any) => p.id).filter(Boolean);
      const { count: despachosCount } = pedidoIds.length > 0
        ? await supabase.from('despachos').select('id', { count: 'exact', head: true }).eq('estado', 'en_ruta').in('pedido_id', pedidoIds)
        : { count: 0 };

      setData({
        cotizaciones: (cotizacionesRaw ?? []).map((c: any) => ({ ...c, total_items: c.cotizacion_items?.[0]?.count ?? 0 })),
        pedidos: (pedidosRaw ?? []).map((p: any) => ({ ...p, estado: p.estado ?? 'pendiente', created_at: p.created_at ?? '' })),
        stats: {
          cotizaciones_pendientes: (cotStats ?? []).filter((c: any) => ['borrador', 'enviada'].includes(c.estado)).length,
          pedidos_en_produccion: (pedStats ?? []).filter((p: any) => p.estado === 'en_produccion').length,
          pedidos_listos: (pedStats ?? []).filter((p: any) => p.estado === 'listo_para_despacho').length,
          despachos_en_ruta: despachosCount ?? 0,
          total_gastado: (pedStats ?? []).filter((p: any) => ['entregado', 'completado'].includes(p.estado)).reduce((acc: number, p: any) => acc + Number(p.total ?? 0), 0),
        },
      });
    } catch (err) {
      setError('No se pudo cargar la información.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cliente]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle size={40} className="text-rose-400" />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">{error}</p>
        <button onClick={fetchData} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-transform active:scale-95">Reintentar</button>
      </div>
    );
  }

  const s = data?.stats;
  const primerNombre = cliente?.razon_social?.split(' ')[0] ?? 'Cliente';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  // ◄ Declarado con tipo estricto KpiItem[] para asegurar coherencia en TypeScript
  const KPIS: KpiItem[] = [
    { label: 'Cotizaciones', value: s?.cotizaciones_pendientes ?? 0, sub: 'Pendientes de cierre', icon: FileText, href: '/portal/cotizaciones' },
    { label: 'En producción', value: s?.pedidos_en_produccion ?? 0, sub: 'Órdenes activas', icon: Layers, href: '/portal/pedidos' },
    { label: 'Listos', value: s?.pedidos_listos ?? 0, sub: 'Para despacho', icon: CheckCircle2, href: '/portal/pedidos' },
    { label: 'En ruta', value: s?.despachos_en_ruta ?? 0, sub: 'Entregas en camino', icon: Truck, href: '/portal/despachos' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ── Cabecera Compacta ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
            <Sparkles size={10} className="text-[#d4af37]" />
            <span className="text-[9px] font-bold text-[#d4af37] uppercase tracking-wider">{saludo}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Hola, <span className="text-[#d4af37]">{primerNombre}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end justify-center px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Inversión Total</span>
            <span className="text-lg font-black text-slate-900">{formatCurrency(s?.total_gastado ?? 0)}</span>
          </div>
          <Link
            href="/portal/cotizaciones/nueva"
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-[#d4af37] rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {/* ── Módulos Separados ── */}
      <KpiCards kpis={KPIS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentQuotes cotizaciones={data?.cotizaciones ?? []} />
        </div>
        <div>
          <RecentOrders pedidos={data?.pedidos ?? []} />
        </div>
      </div>

    </div>
  );
}
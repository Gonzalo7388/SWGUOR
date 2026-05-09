"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Users, AlertTriangle, ShoppingCart,
  RefreshCw, AlertOctagon, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import DashboardCharts from './DashboardCharts';
import { ROLE_PALETTES } from './widgets/DashboardUtils';
import type { insumo, pedidos } from '@prisma/client';
import type { VentaMensual, DashboardKpis } from '@/lib/services/dashboard-service';

type OrdenConCliente = pedidos & { clientes: { razon_social: string; tipo?: string } | null };

interface ApiData {
  kpis: DashboardKpis;
  sparklines: {
    ventas?: number[];
    clientes?: number[];
    pedidos?: number[];
    stock?: number[];
  };
  ventasMensuales: VentaMensual[];
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}

export default function DashboardAdministrador() {
  const [filter, setFilter] = useState('30');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const A = ROLE_PALETTES.administrador;

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dashboard?days=${filter}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 p-6 text-center">
      <AlertOctagon className="w-8 h-8 text-rose-400" />
      <h2 className="font-bold text-slate-800">Error en el panel</h2>
      <p className="text-xs text-slate-500">{error}</p>
      <button
        onClick={() => fetchData()}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-700"
      >
        Reintentar
      </button>
    </div>
  );

  const kpis = data?.kpis;
  const recentOrders = data?.recentOrders ?? [];
  const criticalStock = data?.criticalStock ?? [];
  const sparks = data?.sparklines ?? {};

  return (
    <DashboardSection title="Panel de Administración" role="administrador">

      {/* Cabecera de Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Métricas de Control</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen de operaciones en los últimos {filter} días</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-sky-600 shadow-sm transition-all hover:rotate-180 duration-500"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 gap-1 shadow-sm">
            {['7', '30', '90'].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                  filter === d ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs — Diseño Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SparkKpiCard
          label="Ventas Reales"
          value={kpis ? `S/ ${Number(kpis.total_ventas).toLocaleString('es-PE')}` : '—'}
          delta={12}
          sparkData={sparks.ventas ?? [0, 0, 0, 0, 0]}
          icon={TrendingUp}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Clientes Activos"
          value={kpis?.total_clientes ?? '—'}
          delta={5}
          sparkData={sparks.clientes ?? [0, 0, 0, 0, 0]}
          icon={Users}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Órdenes Totales"
          value={kpis?.nuevas_ordenes ?? '—'}
          delta={8}
          sparkData={sparks.pedidos ?? [0, 0, 0, 0, 0]}
          icon={ShoppingCart}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Alertas Insumos"
          value={kpis?.stock_alerta ?? '—'}
          delta={-2}
          sparkData={sparks.stock ?? [0, 0, 0, 0, 0]}
          icon={AlertTriangle}
          accentColor={A.mid}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Gráfico Principal */}
        <div className="lg:col-span-3">
          <DashboardCharts rol="administrador" data={data?.ventasMensuales} />
        </div>

        {/* Stock Crítico */}
        <div className="lg:col-span-1">
          <StockCriticoList data={criticalStock} />
        </div>

        {/* Órdenes Recientes */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Últimos Movimientos</h2>
              <Link href="/admin/Panel-Administrativo/pedidos" className="text-[10px] font-black text-sky-600 uppercase hover:underline">Ver Gestor de Pedidos</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                ))
              ) : recentOrders.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-400 font-bold uppercase text-xs">Sin actividad reciente</div>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-xl hover:shadow-sky-50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">ORD-{String(o.id).padStart(4, '0')}</span>
                      <ArrowUpRight size={14} className="text-slate-200 group-hover:text-sky-400 transition-colors" />
                    </div>
                    <p className="text-sm font-black text-slate-900 truncate mb-1">{o.clientes?.razon_social ?? 'Cliente Final'}</p>
                    <p className="text-lg font-black text-slate-900 mb-2">S/ {Number(o.total ?? 0).toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        o.estado === 'entregado' ? "bg-emerald-400" : o.estado === 'pendiente' ? "bg-amber-400" : "bg-sky-400"
                      )} />
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{o.estado}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </DashboardSection>
  );
}
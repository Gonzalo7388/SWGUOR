'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Users, AlertTriangle, ShoppingCart,
  RefreshCw, AlertOctagon, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import DashboardCharts from './DashboardCharts';
import { ROLE_PALETTES } from './widgets/DashboardUtils';
import type { insumo, pedidos } from '@prisma/client';
import type { VentaMensual, DashboardKpis } from '@/lib/services/dashboard.service';
import { Button } from '@/components/ui/button';

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
      <Button
        onClick={() => fetchData()}
        className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700"
      >
        Reintentar
      </Button>
    </div>
  );

  const kpis = data?.kpis;
  const recentOrders = data?.recentOrders ?? [];
  const criticalStock = data?.criticalStock ?? [];
  const sparks = data?.sparklines ?? {};

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Panel de Administración"
          description={`Resumen de operaciones y métricas de control en los últimos ${filter} días`}
          actionLabel="Actualizar"
          onAction={() => fetchData(true)}
          icon={RefreshCw}
        />

        {/* Toolbar de Filtros */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
           <div className="flex bg-white border border-slate-100 rounded-2xl p-1 gap-1 shadow-sm">
            {['7', '30', '90'].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                  filter === d ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard
            label="Ventas Reales"
            value={kpis ? `S/ ${Number(kpis.total_ventas).toLocaleString('es-PE')}` : '—'}
            delta={12}
            sparkData={sparks.ventas ?? [0, 0, 0, 0, 0]}
            icon={TrendingUp}
            accentColor="#4f46e5" // Indigo
          />
          <SparkKpiCard
            label="Clientes Activos"
            value={kpis?.total_clientes ?? '—'}
            delta={5}
            sparkData={sparks.clientes ?? [0, 0, 0, 0, 0]}
            icon={Users}
            accentColor="#4f46e5"
          />
          <SparkKpiCard
            label="Órdenes Totales"
            value={kpis?.nuevas_ordenes ?? '—'}
            delta={8}
            sparkData={sparks.pedidos ?? [0, 0, 0, 0, 0]}
            icon={ShoppingCart}
            accentColor="#4f46e5"
          />
          <SparkKpiCard
            label="Alertas Insumos"
            value={kpis?.stock_alerta ?? '—'}
            delta={-2}
            sparkData={sparks.stock ?? [0, 0, 0, 0, 0]}
            icon={AlertTriangle}
            accentColor="#f59e0b" // Orange
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
              <div className="flex justify-between items-center mb-6 px-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">ÚLTIMOS MOVIMIENTOS</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actividad reciente de pedidos</p>
                </div>
                <Link href="/admin/Panel-Administrativo/pedidos" className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl uppercase hover:bg-indigo-600 hover:text-white transition-all">
                  Ver Todo <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
                  ))
                ) : recentOrders.length === 0 ? (
                  <div className="col-span-full py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <ShoppingCart className="w-10 h-10 text-slate-200" />
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin actividad reciente</span>
                    </div>
                  </div>
                ) : (
                  recentOrders.map((o) => (
                    <div
                      key={o.id}
                      className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">ORD-{String(o.id).padStart(4, '0')}</span>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-sm font-black text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">{o.clientes?.razon_social ?? 'Cliente Final'}</p>
                      <p className="text-xl font-black text-slate-900 mb-4 tracking-tighter">S/ {Number(o.total ?? 0).toLocaleString()}</p>
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          o.estado === 'entregado' ? "bg-emerald-500" : o.estado === 'pendiente' ? "bg-amber-500" : "bg-indigo-500"
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
      </div>
    </div>
  );
}
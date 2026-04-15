"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Users, AlertTriangle, ShoppingCart, 
  RefreshCw, AlertOctagon 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import DashboardCharts from './DashboardCharts';
import { ROLE_PALETTES } from './widgets/DashboardUtils';
import type { insumo, ordenes } from '@prisma/client';

type OrdenConCliente = ordenes & { clientes: { razon_social: string; tipo?: string } | null };

interface ApiData {
  kpis: {
    total_ventas: number;
    total_clientes: number;
    stock_alerta: number;
    nuevas_ordenes: number;
  };
  chartIngresos: { created_at: string; total: number }[];
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}

export default function AdminDashboard() {
  const [filter, setFilter] = useState('30');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const A = ROLE_PALETTES.administrador;

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
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
      <button onClick={() => fetchData()} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-700">
        Reintentar
      </button>
    </div>
  );

  return (
    <DashboardSection 
      title="Panel Ejecutivo" 
      role="administrador"
      subtitle="Control total del sistema y métricas globales"
    >
      {/* HEADER DE ACCIONES (Filtros y Refresh) */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <button onClick={() => fetchData(true)}
          className="p-2 rounded-xl border bg-white text-slate-400 hover:text-sky-600 transition-colors"
          style={{ borderColor: A.border }}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex bg-white border rounded-xl p-0.5 gap-0.5" style={{ borderColor: A.border }}>
          {['7', '30', '90'].map((d) => (
            <button key={d} onClick={() => setFilter(d)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all"
              style={filter === d ? { background: A.text, color: '#fff' } : { color: A.accent }}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* KPIs SUPERIORES USANDO SPARK_KPI_CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SparkKpiCard 
          label="Facturación" 
          value={`S/ ${Number(data?.kpis.total_ventas ?? 0).toLocaleString('es-PE')}`} 
          icon={TrendingUp} 
          accentColor={A.accent}
          loading={loading}
        />
        <SparkKpiCard 
          label="Clientes" 
          value={data?.kpis.total_clientes ?? 0} 
          icon={Users} 
          accentColor={A.accent}
          loading={loading}
        />
        <SparkKpiCard 
          label="Alertas Stock" 
          value={data?.kpis.stock_alerta ?? 0} 
          icon={AlertTriangle} 
          accentColor={Number(data?.kpis.stock_alerta) > 0 ? '#ef4444' : A.accent}
          loading={loading}
        />
        <SparkKpiCard 
          label="Órdenes" 
          value={data?.kpis.nuevas_ordenes ?? 0} 
          icon={ShoppingCart} 
          accentColor={A.accent}
          loading={loading}
        />
      </div>

      {/* GRÁFICOS DINÁMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts rol="administrador" />
        </div>
        
        {/* TABLA DE ÓRDENES RECIENTES (Estilo simplificado) */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: A.border }}>
          <h2 className="text-sm font-black mb-4 text-slate-800">Órdenes Recientes</h2>
          <div className="space-y-3">
            {data?.recentOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-sky-700">#{String(o.id).padStart(5, '0')}</p>
                  <p className="text-xs font-bold text-slate-800 truncate w-32">{o.clientes?.razon_social}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">S/ {Number(o.total_pagado).toLocaleString()}</p>
                  <p className="text-[9px] font-bold uppercase text-slate-400">{o.estado}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTAS DE STOCK CRÍTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StockCriticoList data={data?.criticalStock || []} />
        </div>
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tighter mb-2">Resumen de Operaciones</h2>
              <p className="text-sky-300 text-xs font-bold uppercase tracking-widest">Estado actual del Pipeline</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                      <p className="text-[10px] text-sky-200 font-bold uppercase">En Proceso</p>
                      <p className="text-2xl font-black">12</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                      <p className="text-[10px] text-sky-200 font-bold uppercase">Pendientes</p>
                      <p className="text-2xl font-black">5</p>
                  </div>
                  <div className="p-4 bg-emerald-500/20 rounded-2xl backdrop-blur-md border border-emerald-500/30">
                      <p className="text-[10px] text-emerald-200 font-bold uppercase">Completados</p>
                      <p className="text-2xl font-black">142</p>
                  </div>
              </div>
           </div>
           {/* Decoración geométrica */}
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </DashboardSection>
  );
}
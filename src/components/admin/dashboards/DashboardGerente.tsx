"use client";

import React from 'react';
import { 
  TrendingUp, DollarSign, Users, Activity, 
  ArrowUpRight, ArrowDownRight, Briefcase, 
  Target, Award, PieChart as PieIcon 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, VentasMensualesChart, RankingProductos } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';
import type { pedidos } from '@prisma/client';
import type { VentaMensual, DashboardKpis } from '@/lib/services/dashboard-service';

interface GerenteData {
  kpis: DashboardKpis;
  sparklines: any;
  ventasMensuales: VentaMensual[];
  recentOrders: (pedidos & { clientes: { razon_social: string } | null })[];
  balanceData: any[];
  rankingProductos: any[];
}

export default function GerenteDashboard() {
  const G = ROLE_PALETTES.gerente;
  const [data, setData] = React.useState<GerenteData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/dashboard?days=30')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Activity className="animate-spin text-violet-600" size={32} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Calculando métricas estratégicas...</p>
      </div>
    );
  }

  const k = data?.kpis;
  const b = data?.balanceData ?? [];

  return (
    <DashboardSection 
      title="Panel de Gerencia" 
      role="gerente" 
      subtitle="Visibilidad estratégica, métricas de rentabilidad y salud financiera"
    >
      <div className="space-y-6">
        
        {/* 1. KPIs de Alto Nivel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard 
            label="Ingresos Totales" 
            value={`S/ ${Number(k?.facturacion ?? 0).toLocaleString()}`} 
            delta={12} 
            icon={DollarSign} 
            accentColor={G.accent} 
            sparkData={data?.sparklines?.facturacion ?? []} 
          />
          <SparkKpiCard 
            label="Nuevos Clientes" 
            value={k?.clientesB2B ?? 0} 
            delta={5} 
            icon={Users} 
            accentColor={G.accent} 
            sparkData={data?.sparklines?.clientes ?? []} 
          />
          <SparkKpiCard 
            label="Pedidos Activos" 
            value={k?.pedidosActivos ?? 0} 
            delta={2} 
            icon={Activity} 
            accentColor={G.accent} 
            sparkData={data?.sparklines?.pedidos ?? []} 
          />
          <SparkKpiCard 
            label="Cotiz. Pendientes" 
            value={k?.cotizacionesPend ?? 0} 
            delta={4} 
            icon={TrendingUp} 
            accentColor={G.accent} 
            sparkData={data?.sparklines?.cotizaciones ?? []} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 2. Gráfico de Tendencia Principal (Ocupa 3 columnas) */}
          <div className="lg:col-span-3">
            <DashboardCharts rol="gerente" data={data?.ventasMensuales} />
          </div>

          {/* 3. Balance de Situación Rápido */}
          <div className="flex flex-col gap-4">
            {b.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-[24px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-emerald-50' : idx === 1 ? 'bg-amber-50' : 'bg-violet-50'}`}>
                  {idx === 0 ? <Award size={20} className="text-emerald-600" /> : idx === 1 ? <Briefcase size={20} className="text-amber-600" /> : <Target size={20} className="text-violet-600" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-lg font-black text-slate-900 leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
            
            {/* Widget de Meta Mensual */}
            <div className="mt-2 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[32px] p-6 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-bold text-violet-200 uppercase tracking-[0.2em] mb-4">Meta Mensual</h4>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-black">82%</span>
                    <span className="text-xs font-bold text-violet-200 mb-1">S/ {Math.round((k?.facturacion ?? 0) / 1000)}k de S/ 55k</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full">
                    <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '82%' }}></div>
                  </div>
               </div>
               <PieIcon className="absolute -bottom-6 -right-6 text-white/10" size={120} />
            </div>
          </div>
        </div>

        {/* 4. Segunda Fila: Análisis de Ventas y Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-violet-100 rounded-[32px] p-8">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Flujo de Caja Mensual</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Comparativa Ingresos vs Egresos</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-violet-600">
                      <div className="w-2 h-2 rounded-full bg-violet-600"></div> Ingresos
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div> Proyectado
                    </div>
                  </div>
               </div>
               <VentasMensualesChart data={data?.ventasMensuales ?? []} accentColor={G.accent} />
            </div>
          </div>

          <div className="space-y-6">
            <RankingProductos data={data?.rankingProductos ?? []} accentColor={G.accent} />
            
            {/* Resumen Ejecutivo de Clientes */}
            <div className="bg-slate-900 rounded-[32px] p-7 text-white">
              <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Top Clientes (LTV)</h4>
              <div className="space-y-4">
                {(data?.recentOrders ?? []).slice(0, 3).map((o, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate w-32">{o.clientes?.razon_social ?? 'S/N'}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">S/ {Number(o.total ?? 0).toLocaleString()}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
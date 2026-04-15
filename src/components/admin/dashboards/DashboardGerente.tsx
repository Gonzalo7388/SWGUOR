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

export default function GerenteDashboard() {
  const G = ROLE_PALETTES.gerente;

  // Datos simulados para el balance estratégico
  const balanceData = [
    { label: "Margen Neto", value: "32.5%", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Costo Operativo", value: "S/ 12,400", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Proyección Cierre", value: "S/ 58k", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  ];

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
            label="Ingresos Totales" value="S/ 45,280" delta={12} 
            icon={DollarSign} accentColor={G.accent} sparkData={[30, 45, 35, 50, 48, 60]} 
          />
          <SparkKpiCard 
            label="Nuevos Clientes" value="124" delta={5} 
            icon={Users} accentColor={G.accent} sparkData={[10, 15, 8, 20, 25, 22]} 
          />
          <SparkKpiCard 
            label="Efectividad Ventas" value="94.2%" delta={2} 
            icon={Activity} accentColor={G.accent} sparkData={[80, 85, 90, 88, 92, 94]} 
          />
          <SparkKpiCard 
            label="ROI Publicidad" value="4.2x" delta={4} 
            icon={TrendingUp} accentColor={G.accent} sparkData={[3.5, 3.8, 4.0, 3.9, 4.1, 4.2]} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 2. Gráfico de Tendencia Principal (Ocupa 3 columnas) */}
          <div className="lg:col-span-3">
            <DashboardCharts rol="gerente" />
          </div>

          {/* 3. Balance de Situación Rápido */}
          <div className="flex flex-col gap-4">
            {balanceData.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-[24px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`${item.bg} p-3 rounded-2xl`}>
                  <item.icon size={20} className={item.color} />
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
                    <span className="text-xs font-bold text-violet-200 mb-1">S/ 45k de S/ 55k</span>
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
               <VentasMensualesChart data={[]} accentColor={G.accent} />
            </div>
          </div>

          <div className="space-y-6">
            <RankingProductos data={[]} accentColor={G.accent} />
            
            {/* Resumen Ejecutivo de Clientes */}
            <div className="bg-slate-900 rounded-[32px] p-7 text-white">
              <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Top Clientes (LTV)</h4>
              <div className="space-y-4">
                {[
                  { name: "Corporación Textil SAC", total: "S/ 12,450", trend: "up" },
                  { name: "Tiendas Boutique Lima", total: "S/ 8,900", trend: "up" },
                  { name: "Distribuidora Norte", total: "S/ 5,200", trend: "down" },
                ].map((c, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{c.name}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{c.total}</p>
                    </div>
                    {c.trend === 'up' ? 
                      <ArrowUpRight size={16} className="text-emerald-400" /> : 
                      <ArrowDownRight size={16} className="text-rose-400" />
                    }
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
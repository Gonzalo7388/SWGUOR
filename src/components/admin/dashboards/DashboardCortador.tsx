"use client";

import React from 'react';
import { 
  Scissors, Layers, Timer, History, 
  TrendingUp, AlertCircle, CheckCircle2, 
  Play, ClipboardList 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardCortador() {
  const C = ROLE_PALETTES.cortador;

  // Datos de ejemplo para las órdenes de producción
  const ordenesProduccion = [
    { id: 204, prenda: "Pantalón Denim Slim", lotes: 5, estado: "En Proceso", prioridad: "alta" },
    { id: 205, prenda: "Camisa Oxford Blanca", lotes: 12, estado: "Pendiente", prioridad: "normal" },
    { id: 206, prenda: "Polos Jersey Box", lotes: 8, estado: "Pendiente", prioridad: "normal" },
  ];

  return (
    <DashboardSection 
      title="Módulo de Corte" 
      role="cortador"
      subtitle="Control de tendido, corte y habilitado de lotes"
    >
      <div className="space-y-6">
        
        {/* 1. KPIs de Productividad Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard 
            label="Prendas Cortadas" value="450" delta={8} 
            icon={Scissors} accentColor={C.accent} sparkData={[300, 350, 400, 380, 450]}
          />
          <SparkKpiCard 
            label="Lotes Pendientes" value="8" delta={-10} 
            icon={Layers} accentColor={C.accent} 
          />
          <SparkKpiCard 
            label="Eficiencia de Tela" value="94.2%" delta={1.5} 
            icon={TrendingUp} accentColor={C.accent} 
          />
          <SparkKpiCard 
            label="Tiempo Activo" value="6.5h" delta={0} 
            icon={Timer} accentColor={C.accent} 
          />
        </div>

        {/* 2. Gráfico de rendimiento semanal */}
        <DashboardCharts rol="cortador" minimal />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Lista de Órdenes de Corte (Prioridad operativa) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-blue-100 rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest">Cola de Trabajo</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Órdenes asignadas para corte</p>
                </div>
                <ClipboardList className="text-blue-200" size={24} />
              </div>

              <div className="space-y-3">
                {ordenesProduccion.map((orden) => (
                  <div 
                    key={orden.id} 
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        orden.prioridad === 'alta' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        {orden.estado === 'En Proceso' ? <Play size={20} className="fill-current" /> : <Layers size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 uppercase">Orden #{orden.id}</p>
                          {orden.prioridad === 'alta' && (
                            <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Urgente</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{orden.prenda} • {orden.lotes} lotes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Estado</p>
                        <p className={`text-[10px] font-bold uppercase ${orden.estado === 'En Proceso' ? 'text-blue-600' : 'text-slate-500'}`}>
                          {orden.estado}
                        </p>
                      </div>
                      <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shadow-sm">
                        <History size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Alertas de Insumos y Estado de Máquinas */}
          <div className="space-y-6">
            {/* Widget de Stock Crítico re-estilizado para el Cortador (Telas/Hilos) */}
            <StockCriticoList data={[]} />

            {/* Estado de Máquinas/Mesa */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Mantenimiento de Mesa</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Afilado de Cuchillas</span>
                    <span className="text-xs font-black text-emerald-400 uppercase">Óptimo</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-slate-400">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-bold uppercase">Siguiente revisión: 15 Abr</span>
                  </div>
                </div>
              </div>
              <Scissors className="absolute -bottom-6 -right-6 text-white/5" size={120} />
            </div>

            {/* Meta de hoy */}
            <div className="bg-blue-600 rounded-[32px] p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                 <CheckCircle2 size={24} className="text-blue-200" />
                 <span className="text-[10px] font-black bg-blue-500 px-2 py-1 rounded-lg uppercase">Meta Diaria</span>
              </div>
              <p className="text-3xl font-black mb-1">12/15</p>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wide">Lotes Completados</p>
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
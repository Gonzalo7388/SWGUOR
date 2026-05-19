"use client";

import React from 'react';
import {
  Scissors, Layers, Timer, History,
  TrendingUp, AlertCircle, CheckCircle2,
  Play, ClipboardList,
  Plus,
  Filter,
  Clock,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';
import { cn } from '@/lib/utils';

export default function DashboardCortador() {
  const F = ROLE_PALETTES.cortador;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/dashboard?role=cortador')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const colaTrabajo = data?.corte?.cola_trabajo || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Scissors className="animate-bounce text-slate-600" size={32} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Afilando herramientas...</p>
      </div>
    );
  }

  return (
    <DashboardSection
      title="Sala de Corte"
      role="cortador"
      subtitle="Programación de tendido, tizado y corte industrial"
    >
      <div className="space-y-6">

        {/* 1. KPIs Operativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard
            label="Órdenes en Cola" value={colaTrabajo.length} delta={5}
            icon={Scissors} accentColor={F.accent} sparkData={[10, 15, 12, 18, 14, 16]}
          />
          <SparkKpiCard
            label="Telas en Alerta" value={data?.kpis?.stock_alerta ?? "0"} delta={-2}
            icon={AlertTriangle} accentColor="#e11d48" sparkData={[5, 4, 6, 3, 2, 2]}
          />
          <SparkKpiCard
            label="Productividad" value="94%" delta={1}
            icon={Zap} accentColor="#f59e0b" sparkData={[88, 90, 89, 92, 93, 94]}
          />
          <SparkKpiCard
            label="Metros Cortados" value="1.2k" delta={12}
            icon={Activity} accentColor="#059669" sparkData={[800, 950, 1100, 1050, 1200, 1250]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 2. Cola de Trabajo (Columna Principal) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cola de Trabajo</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Órdenes asignadas para habilitación inmediata</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                    <Filter size={16} />
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <Plus size={14} /> Nuevo Lote
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {colaTrabajo.map((orden: any) => (
                  <div
                    key={orden.id}
                    className="group flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        orden.estado === 'pendiente' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400'
                      )}>
                        {orden.estado === 'proceso' ? <Play size={24} className="fill-current" /> : <Layers size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Orden #{orden.id}</p>
                          {orden.prioridad === 'alta' && (
                            <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">Urgente</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{orden.prenda} • <span className="text-blue-600">{orden.lotes} prendas</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Entrega</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock size={12} className="text-slate-400" />
                          <p className="text-xs font-black text-slate-700">{orden.deadline}</p>
                        </div>
                      </div>
                      <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all">
                        <History size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Rendimiento */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Eficiencia por Turno</h3>
              <DashboardCharts rol="cortador" minimal />
            </div>
          </div>

          {/* 3. Columna Derecha */}
          <div className="space-y-8">
            {/* Estado de Máquinas */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-xl">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estado de Maquinaria</h4>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg uppercase">Óptimo</span>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Afilado Cuchillas</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[85%] shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Lubricación Cabezal</span>
                      <span className="text-white">92%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[92%]"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5 text-slate-500">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Próxima Revisión: <span className="text-white">15 May</span></span>
                  </div>
                </div>
              </div>
              <Scissors className="absolute -bottom-10 -right-10 text-white/5 rotate-12" size={180} />
            </div>

            {/* Meta de hoy */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <CheckCircle2 size={24} className="text-blue-200" />
                  </div>
                  <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Producción</span>
                </div>
                <p className="text-5xl font-black mb-2 tracking-tighter">12 / 15</p>
                <p className="text-xs font-bold text-blue-100 uppercase tracking-[0.2em] opacity-80">Lotes Habilitados Hoy</p>
              </div>
              <Layers className="absolute -bottom-10 -right-10 text-white/10" size={160} />
            </div>

            {/* Alertas de Materiales */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Stock Crítico (Telas)</h4>
              <StockCriticoList data={[]} />
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
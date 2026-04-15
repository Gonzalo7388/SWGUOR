"use client";

import React from 'react';
import { 
  CheckSquare, Zap, Target, Package, 
  Truck, Clock, ChevronRight, Star 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard } from './widgets/DashboardWidgets';
import { ROLE_PALETTES, COMPANY_PALETTE } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardAyudante() {
  const A = ROLE_PALETTES.ayudante;

  // Datos de ejemplo para tareas
  const tareasPróximas = [
    { id: 1, task: "Preparar lote #402 para Corte", time: "10:30 AM", status: "urgente" },
    { id: 2, task: "Recepción de telas - Proveedor Textimax", time: "11:45 AM", status: "pendiente" },
    { id: 3, task: "Organizar estantería de avíos (Botones)", time: "02:00 PM", status: "normal" },
  ];

  return (
    <DashboardSection 
      title="Centro de Operaciones" 
      role="ayudante"
      subtitle="Gestión de logística interna y cumplimiento de tareas diarias"
    >
      <div className="space-y-6">
        
        {/* 1. KPIs de Rendimiento Personal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SparkKpiCard 
            label="Tareas Hoy" value="15" delta={20} 
            icon={CheckSquare} accentColor={A.accent} 
          />
          <SparkKpiCard 
            label="Eficiencia Logística" value="98%" delta={1} 
            icon={Zap} accentColor={A.accent} 
          />
          <SparkKpiCard 
            label="Puntos Semanales" value="1,240" delta={5} 
            icon={Star} accentColor={A.accent} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2. Lista de Tareas Operativas (Columna Izquierda/Principal) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#2B1B12] uppercase tracking-widest">Hoja de Ruta</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tareas pendientes para hoy</p>
                </div>
                <button className="text-[10px] font-black text-[#C05A31] hover:underline uppercase">
                  Ver historial
                </button>
              </div>

              <div className="space-y-3">
                {tareasPróximas.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${item.status === 'urgente' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        {item.status === 'urgente' ? <Clock size={18} /> : <Package size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.task}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.time}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border text-orange-600">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Gráfico de Actividad Logística */}
            <DashboardCharts rol="ayudante" minimal />
          </div>

          {/* 4. Columna Derecha (Logística de Almacén) */}
          <div className="space-y-6">
            <div className="bg-[#2B1B12] rounded-[32px] p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-2 bg-white/10 rounded-lg">
                      <Truck size={16} className="text-orange-300" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-wider">Próximos Envíos</span>
                </div>
                <div className="space-y-4">
                   <div className="border-l-2 border-orange-500/30 pl-4">
                      <p className="text-xs font-bold text-orange-200 uppercase tracking-tighter">Taller de Confección</p>
                      <p className="text-lg font-black tracking-tight">Lote #380 - Camisas</p>
                   </div>
                   <div className="border-l-2 border-white/10 pl-4 opacity-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Almacén Central</p>
                      <p className="text-lg font-black tracking-tight">Reposición de Hilos</p>
                   </div>
                </div>
              </div>
              {/* Decoración de fondo */}
              <div className="absolute -bottom-4 -right-4 text-white/5 transform -rotate-12">
                <Package size={120} />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-6">
               <h4 className="text-[10px] font-black text-orange-900 uppercase tracking-widest mb-4">Meta Diaria</h4>
               <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-orange-900">85%</span>
                  <span className="text-[10px] font-bold text-orange-700 mb-1.5">Completado</span>
               </div>
               <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full rounded-full" style={{ width: '85%' }}></div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
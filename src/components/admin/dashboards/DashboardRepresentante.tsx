"use client";

import React from "react";
import { 
  Zap, Truck, Users, Activity, Play, 
  AlertTriangle, CheckCircle2, ChevronRight, 
  Clock, Package, BarChart3, Settings
} from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

// ─── CONFIGURACIÓN DE ESTILO: REPRESENTANTE TALLER (Lime) ──────────────────
const T = {
  primary: '#4d7c0f', // lime-700
  dark:    '#1a2e05', // lime-950
  light:   '#f7fee7', // lime-50
  mid:     '#65a30d', // lime-600
  border:  '#d9f99d', // lime-200
  bg:      '#ecfccb', // lime-100
};

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRepresentante({ usuario }: { usuario: Usuario }) {
  const lotesEnProduccion = [
    { id: "L-405", prenda: "Pantalón Denim",  avance: 65, operarios: 4, prioridad: "Alta",  inicio: "08:30 AM" },
    { id: "L-408", prenda: "Camisa Oxford",   avance: 30, operarios: 3, prioridad: "Media", inicio: "10:15 AM" },
    { id: "L-410", prenda: "Casaca Bomber",   avance: 10, operarios: 2, prioridad: "Baja",  inicio: "11:45 AM" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 min-h-screen" style={{ background: T.light }}>

      {/* HEADER INDUSTRIAL */}
      <header className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: T.border }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ background: T.primary }}>
                Shop Floor Live
              </span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: T.mid }} />
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: T.primary }} />
                </span>
                <span className="text-[10px] font-bold text-lime-600 uppercase tracking-widest">Sincronizado</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none" style={{ color: T.dark }}>
              Planta <span style={{ color: T.mid }}>de</span> Confección
            </h1>
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: T.mid }}>
              <Settings className="w-4 h-4" /> Gestión de flujo y control de calidad · {usuario.nombre_completo}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white border border-lime-200 text-lime-700 hover:bg-lime-50 transition-all shadow-sm">
              Reporte de Turno
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-lg hover:scale-[1.02] active:scale-95"
              style={{ background: T.primary }}>
              <Play className="w-3 h-3 fill-current" /> Iniciar Nuevo Lote
            </button>
          </div>
        </div>
      </header>

      {/* KPI GRID: OPERATIONAL EFFICIENCY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Lotes en Costura" value="18" detail="85% capacidad instalada" icon={Zap} color={T.primary} />
        <StatCard title="Salida proyectada" value="42" detail="Meta del turno: 50 prendas" icon={Truck} color={T.mid} />
        <StatCard title="Personal Activo" value="08" detail="4 módulos en operación" icon={Users} color={T.dark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* MONITOR DE MANUFACTURA (LEFT) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border" style={{ borderColor: T.border }}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase" style={{ color: T.dark }}>Líneas de Producción</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: T.mid }}>Monitoreo de avance por módulo</p>
              </div>
              <Activity className="text-lime-200" size={32} />
            </div>

            <div className="space-y-4">
              {lotesEnProduccion.map((lote) => (
                <div key={lote.id} className="p-6 rounded-[2.5rem] border bg-lime-50/30 hover:bg-white hover:shadow-md transition-all group"
                  style={{ borderColor: T.border }}>
                  <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    
                    {/* ID & Prenda */}
                    <div className="flex items-center gap-5 md:w-1/3">
                      <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-sm shadow-inner"
                        style={{ background: '#fff', borderColor: T.border, color: T.primary }}>
                        {lote.id}
                      </div>
                      <div>
                        <h4 className="font-black uppercase text-sm" style={{ color: T.dark }}>{lote.prenda}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock size={10} className="text-lime-500" />
                           <p className="text-[9px] font-bold uppercase text-lime-600">Desde {lote.inicio}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span style={{ color: T.mid }}>Progreso Total</span>
                        <span style={{ color: T.dark }}>{lote.avance}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full p-0.5 border" style={{ background: '#fff', borderColor: T.border }}>
                        <div className="h-full rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${lote.avance}%`, background: `linear-gradient(to right, ${T.mid}, ${T.primary})` }} />
                      </div>
                    </div>

                    {/* Badge & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        lote.prioridad === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-lime-100 text-lime-800 border-lime-200'
                      }`}>
                        {lote.prioridad}
                      </span>
                      <button className="p-3 rounded-xl bg-white border border-lime-100 text-lime-400 group-hover:text-lime-700 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* QUICK SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-lime-600 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-70 mb-1">Materia Prima</p>
                   <p className="text-2xl font-black">Stock Óptimo</p>
                </div>
                <Package size={40} className="opacity-20" />
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-lime-200 flex justify-between items-center shadow-sm">
                <div>
                   <p className="text-[10px] font-black uppercase text-lime-400 mb-1">Calidad (QA)</p>
                   <p className="text-2xl font-black text-lime-950">98.2% Aprobación</p>
                </div>
                <CheckCircle2 size={40} className="text-lime-100" />
             </div>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS (RIGHT) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CHART AREA */}
          <div className="p-8 rounded-[3rem] shadow-xl text-white overflow-hidden relative" style={{ background: T.dark }}>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black uppercase tracking-widest text-[10px]" style={{ color: T.bg }}>Rendimiento Planta</h3>
                <BarChart3 size={18} className="text-lime-400" />
              </div>
              <DashboardCharts minimal={true} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          </div>

          {/* CRITICAL ALERTS */}
          <div className="p-8 rounded-[3rem] border-2 border-dashed relative group" style={{ background: '#fff1f2', borderColor: '#fecaca' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-900 mb-2">Cuello de Botella Detectado</h4>
                <p className="text-[11px] font-bold leading-relaxed text-rose-700/80">
                  El **Módulo 3** presenta retraso por falta de habilitado. Ayudante requerido en zona de remalle.
                </p>
              </div>
            </div>
          </div>

          {/* STAFF IN TURN */}
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm" style={{ borderColor: T.border }}>
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.dark }}>Staff en Línea</h4>
               <span className="text-[10px] font-bold text-lime-600">8 de 10</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-11 h-11 rounded-2xl border-2 border-lime-100 flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform cursor-help shadow-sm"
                  style={{ background: T.light, color: T.primary }}>
                  OP
                </div>
              ))}
              <div className="w-11 h-11 rounded-2xl border-2 border-lime-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                style={{ background: T.primary }}>
                +2
              </div>
            </div>
            <button className="w-full mt-8 py-4 rounded-2xl border border-lime-200 text-[10px] font-black uppercase text-lime-700 hover:bg-lime-50 transition-colors">
               Gestionar Roles
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────

function StatCard({ title, value, detail, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border hover:shadow-lg transition-all" style={{ borderColor: T.border }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-lime-50" style={{ color: color }}>
          <Icon size={20} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-lime-400">{title}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-black tracking-tighter" style={{ color: T.dark }}>{value}</p>
        <div className="h-1 w-1 rounded-full bg-lime-300" />
        <p className="text-[9px] font-bold uppercase italic text-lime-600">{detail}</p>
      </div>
    </div>
  );
}
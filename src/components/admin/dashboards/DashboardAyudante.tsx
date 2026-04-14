"use client";

import React from "react";
import { 
  CheckSquare, Zap, AlertTriangle, ClipboardList, 
  AlertCircle, Briefcase, ChevronRight, Timer, 
  Star, Target, Trophy, ArrowUpRight
} from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

// ─── CONFIGURACIÓN DE ESTILO: AYUDANTE (Teal) ──────────────────────────────
const A = {
  primary: '#0f766e', // teal-700
  dark:    '#042f2e', // teal-950
  light:   '#f0fdfa', // teal-50
  mid:     '#0d9488', // teal-600
  border:  '#99f6e4', // teal-200
  bg:      '#ccfbf1', // teal-100
};

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardAyudante({ usuario }: { usuario: Usuario }) {
  const tareas = [
    { id: 1, tarea: "Limpieza de mesas de corte",     prioridad: "Urgente", tiempo: "10 min", icon: Zap },
    { id: 2, tarea: "Acarreo de rollos a bodega B",   prioridad: "Normal",  tiempo: "30 min", icon: Briefcase },
    { id: 3, tarea: "Apoyo en remalle de lote #402",  prioridad: "Baja",    tiempo: "1 hr",   icon: CheckSquare },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 min-h-screen" style={{ background: A.light }}>

      {/* HEADER DE ESTADO */}
      <header className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: A.border }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ background: A.primary }}>
                En Servicio
              </span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Planta 1 · Sector B</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: A.dark }}>
              Hola, <span style={{ color: A.mid }}>{usuario.nombre_completo.split(' ')[0]}</span>
            </h1>
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: A.mid }}>
              <Timer className="w-4 h-4" /> Tu jornada termina en 3h 15m
            </p>
          </div>

          {/* META DEL DÍA DINÁMICA */}
          <div className="p-8 rounded-[2rem] border-2 min-w-[320px] shadow-inner flex flex-col justify-center" 
            style={{ background: A.bg, borderColor: A.border }}>
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: A.mid }}>Meta de hoy</p>
                <p className="text-2xl font-black" style={{ color: A.dark }}>Eficiencia 65%</p>
              </div>
              <Target className="w-8 h-8 opacity-20" style={{ color: A.dark }} />
            </div>
            <div className="w-full h-3 rounded-full bg-white/50 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 shadow-sm" 
                style={{ width: '65%', background: A.primary }} />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: A.mid }}>23/35 Tareas</span>
              <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: A.primary }}>Faltan 12</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="Pendientes" value="05" detail="Próximas 4 horas" icon={Zap} color={A.primary} />
        <StatusCard title="Completadas" value="08" detail="+2 comparado a ayer" icon={CheckSquare} color={A.mid} />
        <StatusCard title="Prioritarias" value="02" detail="Atención inmediata" icon={AlertTriangle} color="#b91c1c" isAlert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LISTADO DE TAREAS (HOJA DE RUTA) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-sm border" style={{ borderColor: A.border }}>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase" style={{ color: A.dark }}>Hoja de Ruta</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: A.mid }}>Tareas asignadas para el turno</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
              <ClipboardList size={20} />
            </div>
          </div>

          <div className="space-y-4">
            {tareas.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-6 rounded-[2.5rem] border bg-teal-50/20 hover:bg-white hover:shadow-xl hover:translate-x-2 transition-all cursor-pointer"
                style={{ borderColor: A.border }}>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ 
                      background: t.prioridad === 'Urgente' ? '#fee2e2' : A.bg,
                      color: t.prioridad === 'Urgente' ? '#ef4444' : A.primary 
                    }}>
                    <t.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight" style={{ color: A.dark }}>{t.tarea}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        t.prioridad === 'Urgente' ? 'bg-rose-100 text-rose-700' : 'bg-white text-teal-700'
                      }`}>
                        {t.prioridad}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-teal-400">
                        <Timer size={12} /> {t.tiempo} estimado
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-3 rounded-xl bg-white border border-teal-100 text-teal-300 group-hover:text-teal-600 group-hover:scale-110 transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-5 rounded-[2rem] border-2 border-dashed border-teal-200 text-teal-400 text-xs font-black uppercase tracking-widest hover:bg-teal-50/50 hover:text-teal-600 transition-all">
            Ver historial de tareas
          </button>
        </div>

        {/* FEEDBACK Y RENDIMIENTO (SIDEBAR) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* PERFIL DE DESEMPEÑO */}
          <div className="p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden" style={{ background: A.dark }}>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 opacity-60">Mi Desempeño</h3>
                <div className="space-y-8">
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <p className="text-[10px] font-bold uppercase text-teal-300 mb-1 flex items-center gap-2">
                      <Star className="w-3 h-3 fill-current" /> Racha Semanal
                    </p>
                    <p className="text-xl font-black italic group-hover:translate-x-1 transition-transform">4 Días Impecables</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Trophy className="text-amber-400 shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-teal-300 mb-1">Feedback Supervisor</p>
                        <p className="text-[11px] font-medium leading-relaxed italic opacity-80">
                          "Excelente apoyo en la línea de corte ayer. Mantén esa proactividad."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 opacity-40 hover:opacity-100 transition-opacity">
                <DashboardCharts minimal={true} />
              </div>
            </div>
            
            {/* Decoración visual */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
          </div>

          {/* ACCIÓN RÁPIDA DE ASISTENCIA */}
          <div className="p-8 rounded-[3rem] border-2 border-dashed border-teal-200 bg-white group cursor-pointer hover:border-teal-500 transition-all">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-teal-900">Solicitar Apoyo</h4>
                <p className="text-[10px] font-bold text-teal-400">Notificar al supervisor</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────

function StatusCard({ title, value, detail, icon: Icon, color, isAlert }: any) {
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border-2 transition-all hover:shadow-lg ${
      isAlert ? 'border-rose-100 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.1)]' : 'border-teal-50 shadow-sm'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-2xl ${isAlert ? 'bg-rose-50' : 'bg-teal-50'}`} style={{ color: color }}>
          <Icon size={18} />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${isAlert ? 'text-rose-400' : 'text-teal-400'}`}>
          {title}
        </p>
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-black tracking-tighter" style={{ color: isAlert ? '#881337' : A.dark }}>{value}</p>
        <span className="text-[10px] font-bold text-teal-500 lowercase opacity-70">{detail}</span>
      </div>
    </div>
  );
}
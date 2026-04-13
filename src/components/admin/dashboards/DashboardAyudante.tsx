"use client";

import React from "react";
import { CheckSquare, Zap, AlertTriangle, ClipboardList, AlertCircle, Briefcase } from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

// ─── PALETA ROL: AYUDANTE — teal-100 / teal-700 ──────────────────────────────
const ROLE_ACCENT  = '#0f766e'; // teal-700
const ROLE_BG      = '#ccfbf1'; // teal-100
const ROLE_BG_SOFT = '#f0fdfa'; // teal-50
const ROLE_BORDER  = '#99f6e4'; // teal-200
const ROLE_TEXT    = '#042f2e'; // teal-950
const ROLE_MID     = '#0d9488'; // teal-600

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardAyudante({ usuario }: { usuario: Usuario }) {
  const tareas = [
    { id: 1, tarea: "Limpieza de mesas de corte",     prioridad: "Urgente", tiempo: "10 min" },
    { id: 2, tarea: "Acarreo de rollos a bodega B",   prioridad: "Normal",  tiempo: "30 min" },
    { id: 3, tarea: "Apoyo en remalle de lote #402",  prioridad: "Baja",    tiempo: "1 hr"   },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen font-sans" style={{ background: ROLE_BG_SOFT }}>

      {/* HEADER */}
      <header className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em]" style={{ color: ROLE_MID }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROLE_MID }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: ROLE_ACCENT }} />
              </span>
              Jornada Productiva
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: ROLE_TEXT }}>
              Hola, {usuario.nombre_completo.split(' ')[0]}
            </h1>
            <p className="text-sm font-medium" style={{ color: ROLE_MID }}>Sector: Talleres GUOR · Turno Mañana</p>
          </div>

          {/* Progreso diario */}
          <div className="p-6 rounded-2xl border h-fit min-w-[250px]" style={{ background: ROLE_BG, borderColor: ROLE_BORDER }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: ROLE_MID }}>Meta del Día</span>
              <span className="text-sm font-black px-2.5 py-1 rounded-lg" style={{ color: ROLE_ACCENT, background: ROLE_BG_SOFT }}>65%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: ROLE_BG_SOFT }}>
              <div className="h-full w-[65%] rounded-full transition-all duration-1000" style={{ background: ROLE_ACCENT }} />
            </div>
            <p className="text-[8px] font-bold mt-3 uppercase tracking-widest" style={{ color: ROLE_MID }}>23/35 Tareas completadas</p>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Tareas Pendientes", value: "5", subtitle: "Próximas 4 horas",    icon: Zap,           isAlert: false },
          { title: "Completadas Hoy",   value: "8", subtitle: "+2 que ayer",         icon: CheckSquare,   isAlert: false },
          { title: "Prioridad Alta",    value: "2", subtitle: "Atención inmediata",  icon: AlertTriangle, isAlert: true  },
        ].map(({ title, value, subtitle, icon: Icon, isAlert }) => (
          <div key={title} className="bg-white p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl"
            style={isAlert
              ? { borderColor: '#fca5a5', boxShadow: '0 4px 24px #fca5a510' }
              : { borderColor: 'transparent', borderWidth: '2px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: ROLE_MID }} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: ROLE_MID }}>{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black tracking-tighter" style={{ color: ROLE_TEXT }}>{value}</p>
              <span className="text-[10px] font-bold lowercase" style={{ color: ROLE_MID }}>{subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Hoja de Ruta */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border" style={{ borderColor: ROLE_BORDER }}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5" style={{ color: ROLE_ACCENT }} />
              <h3 className="font-black uppercase tracking-tight" style={{ color: ROLE_TEXT }}>Hoja de Ruta</h3>
            </div>
            <button className="text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-colors"
              style={{ color: ROLE_ACCENT, background: ROLE_BG }}>
              Historial
            </button>
          </div>

          <div className="space-y-4">
            {tareas.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-5 rounded-[2rem] border transition-all cursor-pointer hover:bg-white hover:shadow-lg"
                style={{ borderColor: ROLE_BORDER, background: ROLE_BG_SOFT }}>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={t.prioridad === 'Urgente' ? { background: '#fee2e2' } : { background: ROLE_BG }}>
                    {t.prioridad === 'Urgente'
                      ? <AlertCircle className="w-6 h-6 text-rose-600" />
                      : t.prioridad === 'Normal'
                      ? <CheckSquare className="w-6 h-6" style={{ color: ROLE_ACCENT }} />
                      : <Briefcase className="w-6 h-6" style={{ color: ROLE_MID }} />}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: ROLE_TEXT }}>{t.tarea}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md"
                        style={t.prioridad === 'Urgente'
                          ? { background: '#fee2e2', color: '#b91c1c' }
                          : { background: ROLE_BG, color: ROLE_ACCENT }}>
                        {t.prioridad}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: ROLE_MID }}>{t.tiempo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempeño */}
        <div className="p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden" style={{ background: ROLE_TEXT }}>
          <h3 className="font-black uppercase tracking-tighter mb-6">Mi Desempeño</h3>

          <div className="space-y-6 relative z-10">
            <div className="p-4 rounded-2xl border" style={{ background: `${ROLE_ACCENT}22`, borderColor: `${ROLE_ACCENT}33` }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: ROLE_BG }}>Racha semanal</p>
              <p className="text-xl font-black italic">4 Días Impecables</p>
            </div>
            <div className="p-4 rounded-2xl border" style={{ background: `${ROLE_ACCENT}22`, borderColor: `${ROLE_ACCENT}33` }}>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: ROLE_BG }}>Comentario Supervisor</p>
              <p className="text-sm font-medium" style={{ color: ROLE_BG }}>
                "Buen apoyo en la línea de corte ayer. Sigue así."
              </p>
            </div>
          </div>

          <div className="mt-12">
            <DashboardCharts minimal />
          </div>
        </div>
      </div>
    </div>
  );
}
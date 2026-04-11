"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors, CheckCircle2, AlertTriangle, ArrowRight,
  Layers, Clock, Zap, ChevronRight, Timer,
} from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

const tareasCorte = [
  {
    id: 1, lote: "L-405", producto: "Pantalón Denim Slim",
    capas: 50, tela: "Mezclilla 12oz", prioridad: "Urgente", progreso: 0,
    tallas: ["S", "M", "L", "XL"], color: "Azul Oscuro",
  },
  {
    id: 2, lote: "L-408", producto: "Camisa Oxford Blanca",
    capas: 120, tela: "Algodón Premium", prioridad: "Normal", progreso: 40,
    tallas: ["M", "L"], color: "Blanco Óptico",
  },
  {
    id: 3, lote: "L-409", producto: "Polo Jersey Gris",
    capas: 80, tela: "Jersey 30/1", prioridad: "Normal", progreso: 70,
    tallas: ["S", "M", "L", "XL", "XXL"], color: "Gris Jaspeado",
  },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

function ProgressBar({ value, color = "bg-amber-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function DashboardCortador({ usuario }: { usuario: Usuario }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 space-y-6">

      {/* ── HEADER ── */}
      <header className="relative bg-white rounded-3xl border border-slate-200 p-6 md:p-8 overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-transparent rounded-l-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl">
                <Scissors className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Estación de Corte · Mesa 01</p>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-slate-900 mt-0.5">
                  CENTRO DE CORTE
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-14">
              Op: <span className="text-slate-700">{usuario.nombre_completo}</span>
              <span className="mx-3 text-slate-200">|</span>
              Turno: <span className="text-amber-600">Mañana 07:00 – 15:00</span>
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hora</p>
              <p className="text-lg font-black text-amber-600 tabular-nums"><LiveClock /></p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Eficiencia</p>
              <p className="text-lg font-black text-emerald-600">94.2%</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">En Proceso</p>
              <p className="text-lg font-black text-amber-700">3 Lotes</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pendientes",  value: "15",  sub: "320 capas",     icon: Scissors,      accent: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200",  num: "text-amber-600"  },
          { label: "Completados", value: "23",  sub: "+15% vs ayer",  icon: CheckCircle2,  accent: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200",num: "text-emerald-600"},
          { label: "Urgentes",    value: "3",   sub: "Despacho hoy",  icon: AlertTriangle, accent: "text-rose-600",   bg: "bg-rose-50",    border: "border-rose-200",   num: "text-rose-600",  pulse: true },
          { label: "Tiempo/Lote", value: "28m", sub: "Promedio hoy",  icon: Timer,         accent: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-200",    num: "text-sky-600"    },
        ].map(({ label, value, sub, icon: Icon, accent, bg, border, num, pulse }) => (
          <div key={label} className={`relative bg-white border ${border} p-5 rounded-2xl group hover:shadow-md transition-all overflow-hidden`}>
            {pulse && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${accent}`} />
            </div>
            <p className={`text-3xl font-black tracking-tighter ${num}`}>{value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-[9px] font-bold text-slate-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── CUERPO PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Cola de trabajo */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Cola Activa</p>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Órdenes de Trabajo</h2>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
              <Layers className="w-3.5 h-3.5" />
              {tareasCorte.length} lotes
            </div>
          </div>

          <div className="space-y-3">
            {tareasCorte.map((t, i) => {
              const isActive  = activeId === t.id;
              const isUrgente = t.prioridad === "Urgente";

              return (
                <div
                  key={t.id}
                  onClick={() => setActiveId(isActive ? null : t.id)}
                  className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isUrgente
                      ? 'border-rose-200 bg-rose-50 hover:bg-rose-100/60'
                      : isActive
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <ProgressBar
                    value={t.progreso}
                    color={isUrgente ? "bg-rose-500" : "bg-amber-500"}
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">#{String(i + 1).padStart(2, '0')}</p>
                          <p className={`text-xl font-black tracking-tighter leading-none ${isUrgente ? 'text-rose-600' : 'text-amber-600'}`}>
                            {t.lote}
                          </p>
                        </div>

                        <div className="w-px h-10 bg-slate-200 flex-shrink-0 hidden md:block" />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-800 text-sm uppercase leading-tight group-hover:text-amber-700 transition-colors truncate">
                              {t.producto}
                            </h4>
                            {isUrgente && (
                              <span className="flex-shrink-0 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Urgente
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {t.capas} capas
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{t.tela}</span>
                            <span className="text-[10px] text-slate-300 font-bold">{t.color}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className={`text-lg font-black tabular-nums ${t.progreso === 0 ? 'text-slate-300' : isUrgente ? 'text-rose-600' : 'text-amber-600'}`}>
                            {t.progreso}%
                          </p>
                          <p className="text-[8px] font-black text-slate-400 uppercase">avance</p>
                        </div>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                            isUrgente
                              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200'
                              : 'bg-slate-200 hover:bg-amber-500 hover:text-white text-slate-600 hover:shadow-md hover:shadow-amber-200'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tallas</p>
                          <div className="flex gap-1 flex-wrap">
                            {t.tallas.map(talla => (
                              <span key={talla} className="bg-white border border-slate-200 text-slate-700 text-[9px] font-black px-2 py-1 rounded-lg">
                                {talla}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                          <p className="text-[11px] font-black text-slate-700">{t.color}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tela</p>
                          <p className="text-[11px] font-black text-slate-700">{t.tela}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Capas</p>
                          <p className="text-[11px] font-black text-slate-700">{t.capas} unid.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-5">

          {/* Productividad */}
          <div className="bg-white border border-slate-200 p-7 rounded-3xl shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Rendimiento</p>
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6">Productividad</h3>
            <DashboardCharts minimal={true} />

            <div className="mt-7 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Semanal</span>
                <span className="text-[9px] font-black text-amber-600 uppercase">123 / 150</span>
              </div>
              <ProgressBar value={82} />
              <p className="text-[8px] text-slate-400 font-bold">27 cortes para completar la meta</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Tiempo Promedio", value: "28m", icon: Clock },
                { label: "Piezas / Hora",   value: "2.1", icon: Zap   },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-slate-900">{value}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nota del supervisor */}
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Nota del Supervisor</p>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed italic font-medium">
              "Priorizar el lote L-405, el cliente lo requiere para el despacho de mañana a primera hora."
            </p>
          </div>

          {/* Acceso rápido */}
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
            {[
              { label: "Ver Hoja de Ruta",    icon: ArrowRight    },
              { label: "Reportar Incidencia", icon: AlertTriangle },
              { label: "Historial de Lotes",  icon: Layers        },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all group">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                  {label}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
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

// ── Reloj en vivo ────────────────────────────────────────────────────────────
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

// ── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-amber-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardCortador({ usuario }: { usuario: Usuario }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-4 md:p-8 space-y-6">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="relative bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-8 overflow-hidden">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}
        />
        {/* Acento izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-transparent rounded-l-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Identidad */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                <Scissors className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Estación de Corte · Mesa 01</p>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-white mt-0.5">
                  CENTRO DE CORTE
                </h1>
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-14">
              Op: <span className="text-zinc-300">{usuario.nombre_completo}</span>
              <span className="mx-3 text-zinc-700">|</span>
              Turno: <span className="text-amber-400">Mañana 07:00 – 15:00</span>
            </p>
          </div>

          {/* Stats en tiempo real */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-zinc-800/80 border border-zinc-700/50 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Hora</p>
              <p className="text-lg font-black text-amber-400 tabular-nums"><LiveClock /></p>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/50 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Eficiencia</p>
              <p className="text-lg font-black text-emerald-400">94.2%</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-4 rounded-2xl text-center min-w-[90px]">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">En Proceso</p>
              <p className="text-lg font-black text-amber-300">3 Lotes</p>
            </div>
          </div>

        </div>
      </header>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pendientes",     value: "15",    sub: "320 capas",         icon: Scissors,    accent: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
          { label: "Completados",    value: "23",    sub: "+15% vs ayer",      icon: CheckCircle2, accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Urgentes",       value: "3",     sub: "Despacho hoy",      icon: AlertTriangle, accent: "text-rose-400",  bg: "bg-rose-500/10",   border: "border-rose-500/20", pulse: true },
          { label: "Tiempo/Lote",    value: "28m",   sub: "Promedio hoy",      icon: Timer,       accent: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20" },
        ].map(({ label, value, sub, icon: Icon, accent, bg, border, pulse }) => (
          <div key={label} className={`relative bg-zinc-900 border ${border} p-5 rounded-2xl group hover:bg-zinc-800 transition-all overflow-hidden`}>
            {pulse && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${accent}`} />
            </div>
            <p className={`text-3xl font-black tracking-tighter ${accent}`}>{value}</p>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-[9px] font-bold text-zinc-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── CUERPO PRINCIPAL ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── COLA DE TRABAJO ────────────────────────────────────────────── */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Cola Activa</p>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Órdenes de Trabajo</h2>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase">
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
                      ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                      : isActive
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : 'border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  {/* Barra superior de progreso */}
                  <ProgressBar
                    value={t.progreso}
                    color={isUrgente ? "bg-rose-500" : "bg-amber-500"}
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">

                      {/* Número de orden */}
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-center">
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">#{String(i + 1).padStart(2, '0')}</p>
                          <p className={`text-xl font-black tracking-tighter leading-none ${isUrgente ? 'text-rose-400' : 'text-amber-400'}`}>
                            {t.lote}
                          </p>
                        </div>

                        <div className="w-px h-10 bg-zinc-700 flex-shrink-0 hidden md:block" />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-white text-sm uppercase leading-tight group-hover:text-amber-300 transition-colors truncate">
                              {t.producto}
                            </h4>
                            {isUrgente && (
                              <span className="flex-shrink-0 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Urgente
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {t.capas} capas
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold">{t.tela}</span>
                            <span className="text-[10px] text-zinc-600 font-bold">{t.color}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progreso + acción */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className={`text-lg font-black tabular-nums ${t.progreso === 0 ? 'text-zinc-600' : isUrgente ? 'text-rose-400' : 'text-amber-400'}`}>
                            {t.progreso}%
                          </p>
                          <p className="text-[8px] font-black text-zinc-600 uppercase">avance</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                            isUrgente
                              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-900/50'
                              : 'bg-zinc-700 hover:bg-amber-500 text-white hover:shadow-lg hover:shadow-amber-900/50'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Panel expandido */}
                    {isActive && (
                      <div className="mt-5 pt-5 border-t border-zinc-700/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tallas</p>
                          <div className="flex gap-1 flex-wrap">
                            {t.tallas.map(talla => (
                              <span key={talla} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-black px-2 py-1 rounded-lg">
                                {talla}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Color</p>
                          <p className="text-[11px] font-black text-zinc-300">{t.color}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tela</p>
                          <p className="text-[11px] font-black text-zinc-300">{t.tela}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Capas</p>
                          <p className="text-[11px] font-black text-zinc-300">{t.capas} unid.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Productividad */}
          <div className="bg-zinc-900 border border-zinc-800 p-7 rounded-3xl">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Rendimiento</p>
            <h3 className="font-black text-white uppercase tracking-tight mb-6">Productividad</h3>
            <DashboardCharts minimal={true} />

            {/* Meta semanal */}
            <div className="mt-7 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Meta Semanal</span>
                <span className="text-[9px] font-black text-amber-400 uppercase">123 / 150</span>
              </div>
              <ProgressBar value={82} />
              <p className="text-[8px] text-zinc-700 font-bold">27 cortes para completar la meta</p>
            </div>

            {/* Stats rápidos */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Tiempo Promedio", value: "28m", icon: Clock },
                { label: "Piezas / Hora",   value: "2.1", icon: Zap   },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-zinc-800 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nota del supervisor */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Nota del Supervisor</p>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed italic font-medium">
              "Priorizar el lote L-405, el cliente lo requiere para el despacho de mañana a primera hora."
            </p>
          </div>

          {/* Acceso rápido */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800 overflow-hidden">
            {[
              { label: "Ver Hoja de Ruta",     icon: ArrowRight },
              { label: "Reportar Incidencia",  icon: AlertTriangle },
              { label: "Historial de Lotes",   icon: Layers },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800 transition-all group">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
                  {label}
                </span>
                <Icon className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
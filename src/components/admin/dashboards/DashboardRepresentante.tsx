"use client";

import React from "react";
import { Zap, Truck, Users } from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

// ─── PALETA ROL: REPRESENTANTE DE TALLER — lime-100 / lime-700 ───────────────
const ROLE_ACCENT  = '#4d7c0f'; // lime-700
const ROLE_BG      = '#ecfccb'; // lime-100
const ROLE_BG_SOFT = '#f7fee7'; // lime-50
const ROLE_BORDER  = '#d9f99d'; // lime-200
const ROLE_TEXT    = '#1a2e05'; // lime-950
const ROLE_MID     = '#65a30d'; // lime-600

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRepresentante({ usuario }: { usuario: Usuario }) {
  const lotesEnProduccion = [
    { id: "L-405", prenda: "Pantalón Denim",  avance: 65, operarios: 4, prioridad: "Alta"  },
    { id: "L-408", prenda: "Camisa Oxford",   avance: 30, operarios: 3, prioridad: "Media" },
    { id: "L-410", prenda: "Casaca Bomber",   avance: 10, operarios: 2, prioridad: "Baja"  },
  ];

  return (
    <div className="space-y-8 p-6 min-h-screen" style={{ background: ROLE_BG_SOFT }}>

      {/* HEADER */}
      <header className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em]" style={{ color: ROLE_MID }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROLE_MID }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: ROLE_ACCENT }} />
              </span>
              Producción en Vivo
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: ROLE_TEXT }}>
              Planta <span className="font-light" style={{ color: ROLE_MID }}>de</span> Confección
            </h1>
            <p className="text-sm font-medium" style={{ color: ROLE_MID }}>
              Línea de producción activa · {usuario.nombre_completo}
            </p>
          </div>

          <button className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest h-fit text-white transition-all"
            style={{ background: ROLE_ACCENT }}>
            Iniciar Nuevo Lote
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Lotes en Costura", value: "18", detail: "85% capacidad",    icon: Zap   },
          { title: "Salida del Día",   value: "42", detail: "Meta: 50 prendas", icon: Truck },
          { title: "Equipo Taller",    value: "08", detail: "4 módulos activos", icon: Users },
        ].map(({ title, value, detail, icon: Icon }) => (
          <div key={title} className="bg-white p-6 rounded-[2.5rem] border hover:border-lime-200 transition-all shadow-sm"
            style={{ borderColor: ROLE_BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: ROLE_MID }} />
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: ROLE_MID }}>{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black tracking-tighter" style={{ color: ROLE_TEXT }}>{value}</p>
              <p className="text-[9px] font-bold uppercase italic" style={{ color: ROLE_MID }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Monitoreo de Lotes */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-xl border" style={{ borderColor: ROLE_BORDER }}>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black uppercase tracking-tight" style={{ color: ROLE_TEXT }}>
                Progreso de Manufactura
              </h3>
              <p className="text-[10px] font-bold uppercase mt-1" style={{ color: ROLE_MID }}>Tiempo real por módulo</p>
            </div>
          </div>

          <div className="space-y-6">
            {lotesEnProduccion.map((lote) => (
              <div key={lote.id} className="p-6 rounded-[2.5rem] border transition-all group hover:bg-white"
                style={{ background: ROLE_BG_SOFT, borderColor: 'transparent' }}>
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xs"
                      style={{ background: '#fff', borderColor: ROLE_BORDER, color: ROLE_MID }}>
                      {lote.id}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-sm transition-colors" style={{ color: ROLE_TEXT }}>
                        {lote.prenda}
                      </h4>
                      <p className="text-[9px] font-bold uppercase mt-1" style={{ color: ROLE_MID }}>
                        {lote.operarios} Operarios asignados
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-[200px] space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span style={{ color: ROLE_MID }}>Avance</span>
                      <span style={{ color: ROLE_TEXT }}>{lote.avance}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: ROLE_BG }}>
                      <div className="h-full transition-all duration-1000"
                        style={{ width: `${lote.avance}%`, background: lote.avance > 50 ? ROLE_ACCENT : ROLE_MID }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase"
                      style={lote.prioridad === 'Alta'
                        ? { background: '#fee2e2', color: '#b91c1c' }
                        : { background: ROLE_BG, color: ROLE_ACCENT }}>
                      {lote.prioridad}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analítica y Alertas */}
        <div className="lg:col-span-4 space-y-8">

          <div className="p-8 rounded-[3rem] shadow-2xl text-white" style={{ background: ROLE_TEXT }}>
            <h3 className="font-black uppercase tracking-widest text-[10px] mb-8" style={{ color: ROLE_BG }}>
              Rendimiento Semanal
            </h3>
            <DashboardCharts minimal={true} />
          </div>

          <div className="p-8 rounded-[3rem] border relative overflow-hidden" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-rose-900">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
                Alertas Críticas
              </h4>
              <p className="text-[11px] font-medium leading-relaxed text-rose-700">
                El módulo 3 reporta un retraso por <strong>falta de habilitado</strong>. El ayudante debe abastecer en menos de 15 min.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
            <h4 className="text-[10px] font-black uppercase mb-4" style={{ color: ROLE_TEXT }}>Personal en Turno</h4>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold"
                  style={{ background: ROLE_BG, color: ROLE_ACCENT }}>
                  OP
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: ROLE_ACCENT }}>
                +3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
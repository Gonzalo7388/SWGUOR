"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors, CheckCircle2, AlertTriangle, ArrowRight,
  Layers, Clock, Zap, ChevronRight, Timer,
} from 'lucide-react';
import DashboardCharts from "./DashboardCharts";

// ─── PALETA ROL: CORTADOR — orange-100 / orange-600 ──────────────────────────
const ROLE_ACCENT  = '#ea580c'; // orange-600
const ROLE_BG      = '#ffedd5'; // orange-100
const ROLE_BG_SOFT = '#fff7ed'; // orange-50
const ROLE_BORDER  = '#fed7aa'; // orange-200
const ROLE_TEXT    = '#431407'; // orange-950
const ROLE_MID     = '#f97316'; // orange-500

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

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

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: ROLE_BG }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: ROLE_ACCENT }} />
    </div>
  );
}

export default function DashboardCortador({ usuario }: { usuario: Usuario }) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchDatos() {
    try {
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error cargando cortador:", error);
    } finally {
      setLoading(false);
    }
  }
  fetchDatos();
}, []);

const tareasCorte = data?.recentOrders?.map((orden: any, i: number) => ({
    id: orden.id,
    lote: orden.codigo || `OT-${orden.id.toString().slice(-4)}`, // Usar código de orden como Lote
    producto: orden.clientes?.razon_social || "Pedido General", // O el nombre del producto si lo incluyes en la API
    prioridad: orden.prioridad || (i % 3 === 0 ? 'Urgente' : 'Normal'), // Placeholder si no viene en la API
    capas: Math.floor(Math.random() * 50) + 10, // Dato simulado (la API no devuelve capas aún)
    tela: "Denim Premium", // Dato simulado
    progreso: orden.estado === 'ENTREGADO' ? 100 : 30, // Mapeo lógico según estado
    tallas: ["S", "M", "L", "XL", "XXL"],
    color: "Azul Indigo"
  })) ?? [];

  // KPIs Sincronizados con la API
  const kpisReal = [
    { 
      label: "Pendientes", 
      value: data?.kpis?.nuevas_ordenes ?? "0", 
      sub: "Nuevas órdenes", 
      icon: Scissors, 
      isUrgent: false 
    },
    { 
      label: "Stock Alerta", 
      value: data?.kpis?.stock_alerta ?? "0", 
      sub: "Insumos bajos", 
      icon: AlertTriangle, 
      isUrgent: (data?.kpis?.stock_alerta > 0) 
    },
    { 
      label: "Total Ventas", 
      value: `S/ ${data?.kpis?.total_ventas?.toLocaleString() ?? '0'}`, 
      sub: "Periodo actual", 
      icon: CheckCircle2, 
      isUrgent: false 
    },
    { 
      label: "Clientes", 
      value: data?.kpis?.total_clientes ?? "0", 
      sub: "Activos", 
      icon: Timer, 
      isUrgent: false 
    },
  ];

  if (loading) return <div className="p-10 text-center font-black animate-pulse" style={{color: ROLE_ACCENT}}>CARGANDO ESTACIÓN DE CORTE...</div>;

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 space-y-6" style={{ background: ROLE_BG_SOFT }}>

      {/* HEADER */}
      <header className="relative bg-white rounded-3xl border p-6 md:p-8 overflow-hidden shadow-sm" style={{ borderColor: ROLE_BORDER }}>
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ background: ROLE_ACCENT }} />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border" style={{ background: ROLE_BG, borderColor: ROLE_BORDER }}>
                <Scissors className="w-5 h-5" style={{ color: ROLE_ACCENT }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: ROLE_MID }}>
                  Estación de Corte · Mesa 01
                </p>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none mt-0.5" style={{ color: ROLE_TEXT }}>
                  CENTRO DE CORTE
                </h1>
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest pl-14" style={{ color: ROLE_MID }}>
              Op: <span style={{ color: ROLE_TEXT }}>{usuario.nombre_completo}</span>
              <span className="mx-3 opacity-30">|</span>
              Turno: <span style={{ color: ROLE_ACCENT }}>Mañana 07:00 – 15:00</span>
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Hora', content: <LiveClock />, highlight: true },
              { label: 'Eficiencia', content: '94.2%', highlight: false },
              { label: 'En Proceso', content: '3 Lotes', highlight: true },
            ].map(({ label, content, highlight }) => (
              <div key={label} className="px-5 py-4 rounded-2xl border text-center min-w-[90px]"
                style={highlight
                  ? { background: ROLE_BG, borderColor: ROLE_BORDER }
                  : { background: ROLE_BG_SOFT, borderColor: ROLE_BORDER }}>
                <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: ROLE_MID }}>{label}</p>
                <p className="text-lg font-black" style={{ color: ROLE_ACCENT }}>{content}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
       {kpisReal.map((kpi) => (
          <div key={kpi.label} className="relative bg-white border p-5 rounded-2xl" style={{ borderColor: kpi.isUrgent ? '#fca5a5' : ROLE_BORDER }}>
            <p className="text-3xl font-black tracking-tighter" style={{ color: kpi.isUrgent ? '#ef4444' : ROLE_ACCENT }}>{kpi.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: ROLE_MID }}>{kpi.label}</p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: ROLE_BORDER }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* CUERPO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Cola de trabajo */}
        <div className="lg:col-span-8 bg-white border rounded-3xl p-6 md:p-8 shadow-sm" style={{ borderColor: ROLE_BORDER }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: ROLE_MID }}>Cola Activa</p>
              <h2 className="text-lg font-black uppercase tracking-tight" style={{ color: ROLE_TEXT }}>Órdenes de Trabajo</h2>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase" style={{ color: ROLE_MID }}>
              <Layers className="w-3.5 h-3.5" />
              {tareasCorte.length} lotes
            </div>
          </div>

          <div className="space-y-3">
            {tareasCorte.map((t, i) => {
              const isUrgente = t.prioridad === 'Urgente';
              const isActive  = activeId === t.id;
              return (
                <div key={t.id}
                  onClick={() => setActiveId(isActive ? null : t.id)}
                  className="group rounded-2xl border cursor-pointer transition-all overflow-hidden"
                  style={{ borderColor: isUrgente ? '#fca5a5' : ROLE_BORDER, background: isActive ? ROLE_BG_SOFT : '#fff' }}>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: ROLE_MID }}>#{String(i + 1).padStart(2, '0')}</p>
                          <p className="text-xl font-black tracking-tighter leading-none"
                            style={{ color: isUrgente ? '#ef4444' : ROLE_ACCENT }}>{t.lote}</p>
                        </div>
                        <div className="w-px h-10 flex-shrink-0 hidden md:block" style={{ background: ROLE_BG }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-sm uppercase leading-tight truncate" style={{ color: ROLE_TEXT }}>
                              {t.producto}
                            </h4>
                            {isUrgente && (
                              <span className="flex-shrink-0 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Urgente
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: ROLE_MID }}>
                              <Layers className="w-3 h-3" /> {t.capas} capas
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: ROLE_MID }}>{t.tela}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-lg font-black tabular-nums"
                            style={{ color: t.progreso === 0 ? ROLE_BORDER : isUrgente ? '#ef4444' : ROLE_ACCENT }}>
                            {t.progreso}%
                          </p>
                          <p className="text-[8px] font-black uppercase" style={{ color: ROLE_MID }}>avance</p>
                        </div>
                        <button className="p-3 rounded-xl transition-all flex items-center justify-center"
                          style={isUrgente
                            ? { background: '#ef4444', color: '#fff' }
                            : { background: ROLE_BG, color: ROLE_ACCENT }}>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-5 pt-5 border-t grid grid-cols-2 md:grid-cols-4 gap-4" style={{ borderColor: ROLE_BG }}>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: ROLE_MID }}>Tallas</p>
                          <div className="flex gap-1 flex-wrap">
                            {t.tallas.map(talla => (
                              <span key={talla} className="border text-[9px] font-black px-2 py-1 rounded-lg"
                                style={{ borderColor: ROLE_BORDER, color: ROLE_TEXT }}>{talla}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: ROLE_MID }}>Color</p>
                          <p className="text-[11px] font-black" style={{ color: ROLE_TEXT }}>{t.color}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: ROLE_MID }}>Tela</p>
                          <p className="text-[11px] font-black" style={{ color: ROLE_TEXT }}>{t.tela}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: ROLE_MID }}>Capas</p>
                          <p className="text-[11px] font-black" style={{ color: ROLE_TEXT }}>{t.capas} unid.</p>
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
          <div className="bg-white border p-7 rounded-3xl shadow-sm" style={{ borderColor: ROLE_BORDER }}>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: ROLE_MID }}>Rendimiento</p>
            <h3 className="font-black uppercase tracking-tight mb-6" style={{ color: ROLE_TEXT }}>Productividad</h3>
            <DashboardCharts minimal={true} />
            <div className="mt-7 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: ROLE_MID }}>Meta Semanal</span>
                <span className="text-[9px] font-black uppercase" style={{ color: ROLE_ACCENT }}>123 / 150</span>
              </div>
              <ProgressBar value={82} />
              <p className="text-[8px] font-bold" style={{ color: ROLE_MID }}>27 cortes para completar la meta</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Tiempo Promedio", value: "28m", icon: Clock },
                { label: "Piezas / Hora",   value: "2.1", icon: Zap  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl p-3 text-center border" style={{ background: ROLE_BG_SOFT, borderColor: ROLE_BORDER }}>
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: ROLE_ACCENT }} />
                  <p className="text-lg font-black" style={{ color: ROLE_TEXT }}>{value}</p>
                  <p className="text-[8px] font-black uppercase leading-tight" style={{ color: ROLE_MID }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nota supervisor */}
          <div className="p-6 rounded-2xl border" style={{ background: ROLE_BG, borderColor: ROLE_BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: ROLE_ACCENT }} />
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ROLE_ACCENT }}>Nota del Supervisor</p>
            </div>
            <p className="text-xs leading-relaxed italic font-medium" style={{ color: ROLE_TEXT }}>
              "Priorizar el lote L-405, el cliente lo requiere para el despacho de mañana a primera hora."
            </p>
          </div>

          {/* Acceso rápido */}
          <div className="bg-white border rounded-2xl divide-y overflow-hidden shadow-sm" style={{ borderColor: ROLE_BORDER }}>
            {[
              { label: "Ver Hoja de Ruta",    icon: ArrowRight    },
              { label: "Reportar Incidencia", icon: AlertTriangle },
              { label: "Historial de Lotes",  icon: Layers        },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="w-full flex items-center justify-between px-5 py-4 transition-all group hover:opacity-80"
                style={{ background: '#fff' }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ROLE_MID }}>{label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: ROLE_BORDER }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { 
  Scissors, Clock, CheckCircle, AlertCircle, 
  Layers, Ruler, ChevronRight, Play, 
  TrendingUp
} from "lucide-react";
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardCortador({ usuario }: { usuario: Usuario }) {
  // Datos simulados de la cola de corte
  const tareasCorte = [
    { id: 1, lote: "L-405", producto: "Pantalón Denim Slim", capas: 50, tela: "Mezclilla 12oz", prioridad: "Urgente" },
    { id: 2, lote: "L-408", producto: "Camisa Oxford Blanca", capas: 120, tela: "Algodón Premium", prioridad: "Normal" },
    { id: 3, lote: "L-409", producto: "Polo Jersey Gris", capas: 80, tela: "Jersey 30/1", prioridad: "Normal" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER OPERATIVO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100 rotate-3">
            <Scissors className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Centro de Corte</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Mesa 01</span>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Estación de Alta Precisión</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100">
           <div className="text-right px-4">
              <p className="text-[9px] font-black text-slate-400 uppercase">Eficiencia Hoy</p>
              <p className="text-xl font-black text-slate-900">94.2%</p>
           </div>
           <div className="w-px bg-slate-100 h-10" />
           <div className="px-4">
              <p className="text-[9px] font-black text-slate-400 uppercase">Turno</p>
              <p className="text-xl font-black text-indigo-600 uppercase italic">Mañana</p>
           </div>
        </div>
      </header>

      {/* KPI GRID - MÉTRICAS DE TALLER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Cortes Pendientes" 
          value="15" 
          icon={<Clock size={24} />} 
          color="indigo" 
          detail="Aprox. 320 capas"
        />
        <KpiCard 
          title="Completados Hoy" 
          value="23" 
          icon={<CheckCircle size={24} />} 
          color="emerald" 
          detail="+15% vs ayer"
        />
        <KpiCard 
          title="Lotes Urgentes" 
          value="3" 
          icon={<AlertCircle size={24} />} 
          color="rose" 
          isAlert={true}
          detail="Prioridad de despacho"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLA DE PRODUCCIÓN */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black uppercase text-slate-800 tracking-tight">Orden de Trabajo</h3>
              <p className="text-slate-400 text-xs font-medium">Siguiente lote en línea de corte</p>
            </div>
            <Layers className="text-slate-200" size={40} />
          </div>

          <div className="space-y-4">
            {tareasCorte.map((t) => (
              <div key={t.id} className="group relative bg-slate-50/50 hover:bg-white p-6 rounded-[2.5rem] border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Lote</p>
                      <p className="text-lg font-black text-indigo-600">{t.lote}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden md:block" />
                    <div>
                      <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-sm">{t.producto}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Layers size={12} /> {t.capas} capas
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Ruler size={12} /> {t.tela}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      t.prioridad === 'Urgente' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.prioridad}
                    </span>
                    <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-indigo-600 transition-all">
                      <Play size={16} fill="white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RENDIMIENTO LATERAL (USANDO EL COMPONENTE REFACTOREADO) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={18} />
              Productividad
            </h3>
            
            {/* Aquí pasamos minimal={true} que ya no dará error TS */}
            <DashboardCharts minimal={true} />

            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Meta Semanal</span>
                  <span className="text-[10px] font-black text-white uppercase">150 Cortes</span>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full">
                  <div className="bg-indigo-500 h-full w-[82%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h4 className="font-black uppercase text-slate-800 text-xs mb-4">Nota del Supervisor</h4>
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "Priorizar el lote L-405, el cliente lo requiere para el despacho de mañana a primera hora."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// SUB-COMPONENTE KPI REFINADO
function KpiCard({ title, value, icon, color, isAlert, detail }: any) {
  const colorMap: any = { 
    indigo: 'bg-indigo-50 text-indigo-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    rose: 'bg-rose-50 text-rose-600' 
  };
  
  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all group hover:scale-[1.02] ${
      isAlert ? 'border-rose-100 shadow-lg shadow-rose-50' : 'border-transparent shadow-sm hover:border-slate-100'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-rotate-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{detail}</p>
      </div>
    </div>
  );
}
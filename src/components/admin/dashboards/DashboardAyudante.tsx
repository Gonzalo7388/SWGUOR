"use client";

import React from "react";
import { 
  Clock, CheckCircle, AlertCircle, 
  ChevronRight, PlayCircle, ClipboardList,
  User, Star
} from "lucide-react";
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardAyudante({ usuario }: { usuario: Usuario }) {
  // Datos simulados (Idealmente vendrían de un fetch)
  const tareas = [
    { id: 1, tarea: "Limpieza de mesas de corte", prioridad: "Urgente", tiempo: "10 min" },
    { id: 2, tarea: "Acarreo de rollos a bodega B", prioridad: "Normal", tiempo: "30 min" },
    { id: 3, tarea: "Apoyo en remalle de lote #402", prioridad: "Baja", tiempo: "1 hr" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER PERSONALIZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <User size={32} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-white w-6 h-6 rounded-full" title="En línea" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Hola, {usuario.nombre_completo.split('')[0]}
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
               Sector: Talleres GUOR • Turno Mañana
            </p>
          </div>
        </div>

        {/* PROGRESO DIARIO */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Meta del día</span>
            <span className="text-xs font-black text-emerald-600">65%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[65%] rounded-full transition-all duration-1000" />
          </div>
        </div>
      </div>

      {/* KPI GRID - ENFOQUE EN CARGA DE TRABAJO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Tareas Pendientes" 
          value="5" 
          icon={<Clock size={24} />} 
          color="orange" 
          subtitle="Próximas 4 horas"
        />
        <KpiCard 
          title="Completadas Hoy" 
          value="8" 
          icon={<CheckCircle size={24} />} 
          color="emerald" 
          subtitle="+2 que ayer"
        />
        <KpiCard 
          title="Prioridad Alta" 
          value="2" 
          icon={<AlertCircle size={24} />} 
          color="rose" 
          isAlert={true}
          subtitle="Atención inmediata"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE TAREAS OPERATIVAS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-slate-400" />
              <h3 className="font-black uppercase text-slate-800 tracking-tight">Hoja de Ruta</h3>
            </div>
            <button className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
              Historial
            </button>
          </div>

          <div className="space-y-4">
            {tareas.length > 0 ? (
              tareas.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-5 rounded-[2rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      t.prioridad === 'Urgente' ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 shadow-sm'
                    }`}>
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.tarea}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          t.prioridad === 'Urgente' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.prioridad}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={12} /> {t.tiempo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">¡Excelente! Estás al día</p>
              </div>
            )}
          </div>
        </div>

        {/* LOGROS O NOTIFICACIONES */}
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Star size={160} />
          </div>
          <h3 className="font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Star className="text-yellow-400" size={18} />
            Mi Desempeño
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Racha semanal</p>
              <p className="text-xl font-black italic">4 Días Impecables</p>
            </div>
            
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Comentario Supervisor</p>
              <p className="text-sm font-medium text-slate-200">"Buen apoyo en la línea de corte ayer. Sigue así."</p>
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

function KpiCard({ title, value, icon, color, isAlert, subtitle }: any) {
  const colors: any = { 
    rose: 'bg-rose-50 text-rose-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    orange: 'bg-orange-50 text-orange-600' 
  };

  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl group ${
      isAlert ? 'border-rose-100 shadow-lg shadow-rose-50' : 'border-transparent shadow-sm hover:border-slate-100'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
        <span className="text-[10px] font-bold text-slate-400 lowercase">{subtitle}</span>
      </div>
    </div>
  );
}
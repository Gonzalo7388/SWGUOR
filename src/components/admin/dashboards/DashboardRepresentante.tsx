"use client";

import React from "react";
import { Users, Clock, CheckCircle, Package } from "lucide-react";
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRepresentante({ usuario }: { usuario: Usuario }) {
  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Centro de Confecciones</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gestión del taller y producción</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="En Confección" 
          value="18" 
          icon={<Clock />} 
          color="orange" 
        />
        <KpiCard 
          title="Completadas" 
          value="42" 
          icon={<CheckCircle />} 
          color="emerald" 
        />
        <KpiCard 
          title="Personal Activo" 
          value="8" 
          icon={<Users />} 
          color="blue" 
        />
      </div>

      {/* Sección de estado del taller */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black uppercase text-slate-800">Estado del Taller</h3>
        </div>
        <p className="text-sm text-slate-400">No hay pedidos en confección</p>
      </div>

      {/* Gráficas */}
      <DashboardCharts />
    </div>
  );
}

function KpiCard({ title, value, icon, color, isAlert }: any) {
  const colors: any = { 
    rose: 'bg-rose-50 text-rose-600', 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    orange: 'bg-orange-50 text-orange-600' 
  };
  return (
    <div className={`bg-white p-6 rounded-4xl border-2 transition-all ${isAlert ? 'border-rose-200 shadow-lg shadow-rose-100' : 'border-transparent shadow-sm'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
"use client";

import React from "react";
import { 
  Users, Clock, CheckCircle, Package, 
  Activity, ArrowUpRight, Hammer, 
  AlertTriangle, Settings2, PlayCircle 
} from "lucide-react";
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRepresentante({ usuario }: { usuario: Usuario }) {
  // Datos simulados del piso de producción
  const lotesEnProduccion = [
    { id: "L-405", prenda: "Pantalón Denim", avance: 65, operarios: 4, prioridad: "Alta" },
    { id: "L-408", prenda: "Camisa Oxford", avance: 30, operarios: 3, prioridad: "Media" },
    { id: "L-410", prenda: "Casaca Bomber", avance: 10, operarios: 2, prioridad: "Baja" },
  ];

  return (
    <div className="space-y-8 p-6 bg-[#f9fafb] min-h-screen">
      
      {/* HEADER DE CONTROL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200">
            <Hammer className="text-emerald-400" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Planta <span className="text-slate-400 font-light">de</span> Confección
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Línea de Producción Activa • {usuario.nombre_completo}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Settings2 size={20} className="text-slate-600" />
          </button>
          <button className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
            <PlayCircle size={18} /> Iniciar Nuevo Lote
          </button>
        </div>
      </header>

      {/* MÉTRICAS DE PLANTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Lotes en Costura" 
          value="18" 
          icon={<Activity size={24} />} 
          color="orange" 
          detail="85% capacidad"
        />
        <KpiCard 
          title="Salida del Día" 
          value="42" 
          icon={<CheckCircle size={24} />} 
          color="emerald" 
          detail="Meta: 50 prendas"
        />
        <KpiCard 
          title="Equipo Taller" 
          value="08" 
          icon={<Users size={24} />} 
          color="blue" 
          detail="4 módulos activos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MONITOREO DE LOTES */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black uppercase text-slate-800 tracking-tight flex items-center gap-2">
                <Package className="text-orange-500" size={20} />
                Progreso de Manufactura
              </h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Tiempo real por módulo</p>
            </div>
          </div>

          <div className="space-y-6">
            {lotesEnProduccion.map((lote) => (
              <div key={lote.id} className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-400">
                      {lote.id}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-sm group-hover:text-orange-600 transition-colors">
                        {lote.prenda}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-2 mt-1">
                        <Users size={12} /> {lote.operarios} Operarios asignados
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-[200px] space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                      <span className="text-slate-400">Avance</span>
                      <span className="text-slate-900">{lote.avance}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          lote.avance > 50 ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${lote.avance}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      lote.prioridad === 'Alta' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {lote.prioridad}
                    </span>
                    <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-md transition-all">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ANALÍTICA Y ALERTAS */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-widest text-[10px] mb-8 text-slate-400">Rendimiento Semanal</h3>
            <DashboardCharts minimal={true} />
          </div>

          <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 relative overflow-hidden">
            <AlertTriangle className="absolute -right-2 -bottom-2 text-rose-200/50" size={80} />
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
                Alertas Críticas
              </h4>
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                El módulo 3 reporta un retraso por <strong>falta de habilitado</strong>. El ayudante debe abastecer en menos de 15 min.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Users size={20} />
               </div>
               <h4 className="text-[10px] font-black text-slate-800 uppercase">Personal en Turno</h4>
             </div>
             <div className="flex -space-x-3">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                   OP
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                 +3
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, detail }: any) {
  const colorMap: any = { 
    orange: 'bg-orange-50 text-orange-600', 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600' 
  };
  
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-transparent hover:border-slate-100 transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase italic">{detail}</p>
      </div>
    </div>
  );
}
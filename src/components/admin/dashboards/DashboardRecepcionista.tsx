"use client";

import React from 'react';
import { 
  Users, UserPlus, ShoppingBag, FileText, Heart, 
  Search, Plus, Clock, MessageCircle, ChevronRight,
  Filter, Calendar, MapPin
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import { cn } from '@/lib/utils';

export default function DashboardRecepcionista() {
  const F = ROLE_PALETTES.recepcionista;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/dashboard?role=recepcionista')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cotizacionesRecientes = data?.recepcion?.cotizaciones_recientes || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="animate-pulse text-amber-600" size={32} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Preparando recepción...</p>
      </div>
    );
  }

  return (
    <DashboardSection 
      title="Atención al Cliente" 
      role="recepcionista" 
      subtitle="Gestión de visitas, cotizaciones y atención presencial"
    >
      <div className="space-y-6">
        
        {/* Barra de Acciones Rápidas */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-orange-100 p-4 rounded-[2.5rem] shadow-sm">
          <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o DNI..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              <UserPlus size={18} className="text-orange-600" /> Nuevo Cliente
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
              <Plus size={18} /> Crear Pedido
            </button>
          </div>
        </div>

        {/* 1. KPIs de Atención */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard 
            label="Pedidos Hoy" value={data?.recepcion?.pedidos_hoy ?? "0"} delta={8} 
            icon={ShoppingBag} accentColor={F.accent} sparkData={[10, 15, 12, 18, 14, 16]} 
          />
          <SparkKpiCard 
            label="Nuevos Clientes" value={data?.kpis?.total_clientes ?? "0"} delta={2} 
            icon={UserPlus} accentColor="#0ea5e9" sparkData={[2, 3, 5, 4, 6, 8]} 
          />
          <SparkKpiCard 
            label="Cotizaciones" value={cotizacionesRecientes.length} delta={12} 
            icon={FileText} accentColor="#f59e0b" sparkData={[20, 25, 22, 28, 30, 32]} 
          />
          <SparkKpiCard 
            label="Satisfacción" value="98%" delta={1} 
            icon={Heart} accentColor="#e11d48" sparkData={[95, 96, 97, 98, 98, 99]} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agenda y Atención Presencial */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-orange-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Atenciones Recientes</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Seguimiento de cotizaciones y visitas</p>
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                  <Filter size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {cotizacionesRecientes.map((item: any) => (
                  <div key={item.id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl hover:shadow-orange-50/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.cliente}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-orange-600 uppercase">S/ {item.total}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">• {item.estado}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cotización</span>
                        <span className="text-xs font-black text-slate-700">#{item.id}</span>
                      </div>
                      <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accesos Directos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white group cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Registro Rápido</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase mb-6">Inscribir nuevo cliente corporativo</p>
                  <button className="flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Empezar Ahora <ChevronRight size={14} />
                  </button>
                </div>
                <UserPlus size={120} className="absolute -bottom-10 -right-10 text-white/5 group-hover:text-white/10 transition-colors rotate-12" />
              </div>

              <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white group cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Muestras Gratis</h4>
                  <p className="text-xs text-orange-100 font-medium uppercase mb-6">Gestionar envío de catálogos</p>
                  <button className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Ver Solicitudes <ChevronRight size={14} />
                  </button>
                </div>
                <MapPin size={120} className="absolute -bottom-10 -right-10 text-white/10 group-hover:text-white/20 transition-colors -rotate-12" />
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            {/* Mensajería Directa */}
            <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-500 rounded-3xl text-white shadow-lg shadow-emerald-100">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950 uppercase">Canales Digitales</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Consultas de clientes</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: "P. Gonzáles", time: "09:45", msg: "Consulta por catálogo 2024" },
                  { name: "Textil Norte", time: "10:15", msg: "Estado de cotización #452" }
                ].map((chat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 uppercase">{chat.name}</span>
                      <span className="text-[9px] font-bold text-slate-400">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{chat.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda Semanal */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Próximos Eventos</h4>
              <div className="space-y-6">
                {[
                  { date: "15 May", event: "Lanzamiento Colección Invierno" },
                  { date: "18 May", event: "Visita Corporativa - Grupo A" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-900 leading-none">{item.date.split(' ')[0]}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{item.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-tight mb-1">{item.event}</p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                        <Calendar size={10} /> 09:00 AM
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
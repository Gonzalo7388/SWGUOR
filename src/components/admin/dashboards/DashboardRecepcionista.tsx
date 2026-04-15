"use client";

import React from 'react';
import { 
  Clock, Plus, Users, MessageCircle, 
  Search, UserPlus, PhoneIncoming, 
  CheckCircle2, Calendar, ChevronRight
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, UltimasVentas } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardRecepcionista() {
  const R = ROLE_PALETTES.recepcionista;

  // Datos de ejemplo para la cola de atención
  const colaAtencion = [
    { id: 1, cliente: "Juan Perez", motivo: "Recojo de Lote #204", tiempo: "5 min", priority: "alta" },
    { id: 2, cliente: "Textiles del Sur", motivo: "Consulta de Precios", tiempo: "12 min", priority: "normal" },
    { id: 3, cliente: "Maria Garcia", motivo: "Muestra de Telas", tiempo: "15 min", priority: "normal" },
  ];

  return (
    <DashboardSection 
      title="Recepción y Atención" 
      role="recepcionista"
      subtitle="Gestión de flujo de clientes y registro de actividad diaria"
    >
      <div className="space-y-6">
        
        {/* 1. Buscador y Acciones Rápidas */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[24px] border border-orange-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente por nombre o DNI..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black uppercase hover:bg-orange-700 transition-colors">
              <UserPlus size={16} /> Nuevo Cliente
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-black transition-colors">
              <Plus size={16} /> Crear Pedido
            </button>
          </div>
        </div>

        {/* 2. KPIs de Gestión */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard 
            label="Pedidos Hoy" value="12" delta={8} 
            icon={Plus} accentColor={R.accent} sparkData={[2, 5, 8, 4, 10, 12]} 
          />
          <SparkKpiCard 
            label="Clientes en Espera" value="3" delta={-2} 
            icon={Clock} accentColor={R.accent} 
          />
          <SparkKpiCard 
            label="Consultas WhatsApp" value="28" delta={15} 
            icon={MessageCircle} accentColor="#25D366" sparkData={[10, 12, 20, 18, 25, 28]} 
          />
          <SparkKpiCard 
            label="Nuevos Leads" value="6" delta={2} 
            icon={Users} accentColor={R.accent} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Cola de Atención (Columna Principal) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">En Sala de Espera</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Clientes esperando atención presencial</p>
                </div>
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <PhoneIncoming size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Atendiendo ahora</span>
                </div>
              </div>

              <div className="space-y-3">
                {colaAtencion.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.priority === 'alta' ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.cliente}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.motivo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Espera</p>
                        <p className="text-xs font-bold text-slate-700">{item.tiempo}</p>
                      </div>
                      <button className="p-2 rounded-xl bg-orange-100 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de flujo de visitas */}
            <DashboardCharts rol="recepcionista" minimal />
          </div>

          {/* 4. Columna Derecha (Ventas y Agenda) */}
          <div className="space-y-6">
            <UltimasVentas data={[]} accentColor={R.accent} />

            {/* Agenda del día */}
            <div className="bg-[#2B1B12] rounded-[32px] p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                   <Calendar size={18} className="text-orange-400" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest">Citas para hoy</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black text-orange-400 pt-1">04 PM</span>
                    <div>
                      <p className="text-xs font-bold">Entrega Lote #102</p>
                      <p className="text-[9px] text-slate-400 uppercase">Cliente: Modas Lima</p>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-50">
                    <span className="text-[10px] font-black text-slate-500 pt-1">05 PM</span>
                    <div>
                      <p className="text-xs font-bold">Cierre de Caja</p>
                      <p className="text-[9px] text-slate-400 uppercase">Proceso Diario</p>
                    </div>
                  </div>
                </div>
              </div>
              <Calendar className="absolute -bottom-6 -right-6 text-white/5" size={120} />
            </div>

            {/* Banner de Recordatorio */}
            <div className="bg-orange-100 border border-orange-200 rounded-[32px] p-6">
              <p className="text-[10px] font-black text-orange-900 uppercase mb-2">Tip de Atención</p>
              <p className="text-xs text-orange-800 font-medium leading-relaxed">
                Recuerda pedir el <span className="font-black">correo electrónico</span> a todos los nuevos clientes para el catálogo digital.
              </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
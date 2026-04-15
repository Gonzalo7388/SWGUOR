"use client";

import React from 'react';
import { 
  Truck, Layers, AlertTriangle, CheckCircle2, Warehouse,
  Calendar, MapPin, ChevronRight, ArrowRightLeft, Timer
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardRepresentante() {
  const T = ROLE_PALETTES.representante_taller;

  // Datos de ejemplo para el seguimiento de lotes
  const lotesExternos = [
    { id: 401, taller: "Taller Santa Anita", servicio: "Costura Recta", estado: "En Proceso", entrega: "Mañana", avance: 65 },
    { id: 402, taller: "Confecciones J&M", servicio: "Acabado y Vapor", estado: "Retrasado", entrega: "Ayer", avance: 90 },
    { id: 403, taller: "Bordados Express", servicio: "Logotipado", estado: "Listo para Recojo", entrega: "Hoy", avance: 100 },
  ];

  return (
    <DashboardSection 
      title="Control de Talleres" 
      role="representante_taller"
      subtitle="Logística externa, control de maquila y tiempos de entrega"
    >
      <div className="space-y-6">
        
        {/* 1. KPIs de Flujo Externo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard 
            label="Envíos a Taller" value="18" delta={3} 
            icon={Truck} accentColor={T.accent} sparkData={[10, 15, 12, 14, 16, 18]} 
          />
          <SparkKpiCard 
            label="Prendas en Proceso" value="2,450" delta={-5} 
            icon={Layers} accentColor={T.accent} sparkData={[2800, 2600, 2500, 2450]} 
          />
          <SparkKpiCard 
            label="Calidad de Entrega" value="99.2%" delta={1} 
            icon={CheckCircle2} accentColor={T.accent} sparkData={[95, 96, 98, 97, 99]} 
          />
          <SparkKpiCard 
            label="Alertas de Retraso" value="2" delta={100} 
            icon={AlertTriangle} accentColor="#ef4444" sparkData={[0, 0, 1, 0, 2]} 
          />
        </div>

        {/* 2. Gráfico de Capacidad y Producción Externa */}
        <DashboardCharts rol="representante_taller" minimal />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Panel de Control de Lotes (Pipeline) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-lime-100 rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-lime-900 uppercase tracking-widest">Pipeline de Producción Externa</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Estado actual de lotes por taller</p>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 bg-lime-50 text-lime-600 rounded-xl hover:bg-lime-100 transition-colors">
                      <ArrowRightLeft size={18} />
                   </button>
                   <button className="px-4 py-2 bg-lime-600 text-white rounded-xl text-[10px] font-black uppercase shadow-sm shadow-lime-200">
                      Registrar Salida
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                {lotesExternos.map((lote) => (
                  <div 
                    key={lote.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      lote.estado === 'Retrasado' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100 hover:border-lime-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          lote.estado === 'Retrasado' ? 'bg-red-100 text-red-600' : 'bg-lime-100 text-lime-600'
                        }`}>
                          <Warehouse size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-800 uppercase">Lote #{lote.id}</h4>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                              lote.estado === 'Retrasado' ? 'bg-red-500 text-white' : 'bg-lime-200 text-lime-700'
                            }`}>
                              {lote.estado}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" /> {lote.taller}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 max-w-[200px]">
                        <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                           <span className="text-slate-400">Progreso</span>
                           <span className="text-slate-700">{lote.avance}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div 
                            className={`h-full rounded-full ${lote.estado === 'Retrasado' ? 'bg-red-400' : 'bg-lime-500'}`} 
                            style={{ width: `${lote.avance}%` }}
                           />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="hidden sm:block">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Entrega Pactada</p>
                          <p className={`text-xs font-black ${lote.estado === 'Retrasado' ? 'text-red-600' : 'text-slate-700'}`}>
                            {lote.entrega}
                          </p>
                        </div>
                        <ChevronRight className="text-slate-300" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Columna Derecha: Alertas y Agenda Logística */}
          <div className="space-y-6">
            <StockCriticoList data={[]} />

            {/* Agenda de Recojos */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar size={18} className="text-lime-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Ruta de Recojos Hoy</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="relative pl-6 border-l-2 border-dashed border-lime-500/30">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-lime-500 border-4 border-slate-900" />
                    <p className="text-[10px] font-black text-lime-400 uppercase tracking-tighter">10:00 AM</p>
                    <p className="text-xs font-bold">Taller Gamarra Central</p>
                    <p className="text-[9px] text-slate-400 font-medium">Recoger Lote #398 (Polos)</p>
                  </div>

                  <div className="relative pl-6 border-l-2 border-dashed border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-900" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">02:30 PM</p>
                    <p className="text-xs font-bold">Avío Textil SAC</p>
                    <p className="text-[9px] text-slate-400 font-medium">Entrega de Cierres y Hilos</p>
                  </div>
                </div>
              </div>
              <Truck className="absolute -bottom-10 -right-10 text-white/5 -rotate-12" size={180} />
            </div>

            {/* KPI de Tiempo de Ciclo */}
            <div className="bg-lime-100 rounded-[32px] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-xl text-lime-600">
                  <Timer size={20} />
                </div>
                <h4 className="text-[10px] font-black text-lime-900 uppercase tracking-widest">Lead Time Promedio</h4>
              </div>
              <p className="text-3xl font-black text-lime-900">4.2 <span className="text-sm">días</span></p>
              <p className="text-[10px] text-lime-700 font-bold uppercase mt-1">
                <span className="text-emerald-600">↓ 0.5 días</span> respecto al mes pasado
              </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
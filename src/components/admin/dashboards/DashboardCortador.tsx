"use client";
import React from 'react';
import { Scissors, Layers, Timer, History } from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardCortador() {
  const C = ROLE_PALETTES.cortador;

  return (
    <DashboardSection title="Módulo de Corte" role="cortador">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/*} KPIs Superiores */}
        <SparkKpiCard 
          label="Cortes Realizados" value="450" delta={8} 
          icon={Scissors} accentColor={C.accent} 
        />
        <SparkKpiCard 
          label="Lotes Pendientes" value="8" delta={-10} 
          icon={Layers} accentColor={C.accent} 
        />
        <SparkKpiCard 
          label="Horas Activo" value="6.5h" delta={0} 
          icon={Timer} accentColor={C.accent} 
        />
      </div>

      {/* Gráfico Adaptado */}
      <DashboardCharts rol="cortador" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockCriticoList data={[]} />
        {/* Aquí podrías poner una tabla de órdenes de corte */}
        <div className="bg-white p-6 rounded-xl border border-blue-100 min-h-[300px]">
          <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
            <History size={16} /> Últimas Órdenes de Corte
          </h3>
          {/* Aquí iría la tabla de órdenes de corte */}
          <div className="space-y-3">
             {[1,2,3].map(i => (
               <div key={i} className="p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                  <span className="font-bold text-blue-800 text-xs">ORDEN #20{i} - Camisas</span>
                  <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-1 rounded-full font-black">COMPLETADA</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
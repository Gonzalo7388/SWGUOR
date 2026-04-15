"use client";
import React from 'react';
import { 
  Truck, Layers, AlertTriangle, CheckCircle2, Warehouse 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardRepresentante() {
  const T = ROLE_PALETTES.representante_taller;

  return (
    <DashboardSection 
      title="Control de Talleres" 
      role="representante_taller"
      subtitle="Logística externa y seguimiento de lotes de producción"
    >
      {/* KPIs Superiores */}
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
          label="Control Calidad" value="99.2%" delta={1} 
          icon={CheckCircle2} accentColor={T.accent} sparkData={[95, 96, 98, 97, 99]} 
        />
        <SparkKpiCard 
          label="Alertas Taller" value="2" delta={100} 
          icon={AlertTriangle} accentColor="#ef4444" sparkData={[0, 0, 1, 0, 2]} 
        />
      </div>

      {/* Gráfico Adaptado */}
      <DashboardCharts rol = "representante_taller" />

      {/* Listado de Lotes en Taller */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-xl border border-lime-100 min-h-[300px]">
              <h3 className="text-sm font-bold text-lime-900 mb-4 flex items-center gap-2">
                <Warehouse size={16} /> Estado de Lotes Externos
              </h3>
              {/* Aquí iría la tabla de lotes que tenías antes pero con estilo limpio */}
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="p-4 bg-lime-50 rounded-lg flex justify-between items-center border border-lime-100">
                      <span className="font-bold text-lime-800 text-xs">LOTE #40{i} - Camisas</span>
                      <span className="text-[10px] bg-lime-200 text-lime-700 px-2 py-1 rounded-full font-black">EN COSTURA</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
        <StockCriticoList data={[]} />
      </div>
    </DashboardSection>
  );
}
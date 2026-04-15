"use client";
import React from 'react';
import { Clock, Plus, Users, MessageCircle } from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, UltimasVentas } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardRecepcionista() {
  const R = ROLE_PALETTES.recepcionista;

  return (
    <DashboardSection title="Recepción y Atención" role="recepcionista">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* KPIs Superiores */}
        <SparkKpiCard 
          label="Pedidos de Hoy" value="12" delta={0} 
          icon={Plus} accentColor={R.accent} sparkData={[2, 5, 8, 4, 10, 12]} 
        />
        <SparkKpiCard 
          label="Clientes en Espera" value="4" delta={-2} 
          icon={Clock} accentColor={R.accent} sparkData={[6, 5, 4, 7, 5, 4]} 
        />
        <SparkKpiCard 
          label="Consultas" value="28" delta={15} 
          icon={MessageCircle} accentColor={R.accent} sparkData={[10, 12, 20, 18, 25, 28]} 
        />
      </div>
      {/* Grafico Adaptado */}
      <DashboardCharts rol="recepcionista" />

      {/* Listado de Ventas Recientes */}
      <UltimasVentas data={[]} accentColor={R.accent} />
    </DashboardSection>
  );
}
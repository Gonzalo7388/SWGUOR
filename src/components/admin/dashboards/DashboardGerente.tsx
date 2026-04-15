"use client";
import React from 'react';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, VentasMensualesChart, RankingProductos } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function GerenteDashboard() {
  const G = ROLE_PALETTES.gerente;

  return (
    <DashboardSection 
      title="Panel de Gerencia" 
      role="gerente" 
      subtitle="Visibilidad total del sistema y métricas financieras"
    >
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SparkKpiCard 
          label="Ingresos Totales" value="S/ 45,280" delta={12} 
          icon={DollarSign} accentColor={G.accent} sparkData={[30, 45, 35, 50, 48, 60]} 
        />
        <SparkKpiCard 
          label="Nuevos Clientes" value="124" delta={5} 
          icon={Users} accentColor={G.accent} sparkData={[10, 15, 8, 20, 25, 22]} 
        />
        <SparkKpiCard 
          label="Eficiencia" value="94%" delta={2} 
          icon={Activity} accentColor={G.accent} sparkData={[80, 85, 90, 88, 92, 94]} 
        />
        <SparkKpiCard 
          label="Crecimiento" value="+18%" delta={4} 
          icon={TrendingUp} accentColor={G.accent} sparkData={[5, 10, 15, 12, 18, 20]} 
        />
      </div>
      {/* Gráfico Adaptado */}
      <DashboardCharts rol="gerente" />
      
      {/* Listado de Ventas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VentasMensualesChart data={[]} accentColor={G.accent} />
        </div>
        <RankingProductos data={[]} accentColor={G.accent} />
      </div>
    </DashboardSection>
  );
}
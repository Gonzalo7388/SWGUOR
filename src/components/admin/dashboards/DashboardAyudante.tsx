"use client";
import React from 'react';
import { CheckSquare, Zap, Target } from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";

export default function DashboardAyudante() {
  const A = ROLE_PALETTES.ayudante;

  return (
    <DashboardSection title="Mis Tareas" role="ayudante">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SparkKpiCard 
          label="Tareas Hoy" value="15" delta={20} 
          icon={CheckSquare} accentColor={A.accent} 
        />
        <SparkKpiCard 
          label="Puntos Logrados" value="1,200" delta={5} 
          icon={Target} accentColor={A.accent} 
        />
        <SparkKpiCard 
          label="Productividad" value="98%" delta={1} 
          icon={Zap} accentColor={A.accent} 
        />
      </div>
      {/* Aquí pones tu lista de tareas personalizada */}
    </DashboardSection>
  );
}
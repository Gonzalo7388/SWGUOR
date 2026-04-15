"use client";

import { 
  Shirt, Sparkles, Upload, Scissors, 
  FileText, Palette 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, RankingProductos } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardDisenador() {
  const F = ROLE_PALETTES.disenador;

  return (
    <DashboardSection 
      title="Estudio de Diseño" 
      role="disenador" 
      subtitle="Gestión de moldes, escalados y fichas técnicas"
    >
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SparkKpiCard 
          label="Nuevos Diseños" value="24" delta={15} 
          icon={Shirt} accentColor={F.accent} sparkData={[5, 12, 8, 15, 20, 24]} 
        />
        <SparkKpiCard 
          label="Moldes Listos" value="142" delta={2} 
          icon={Scissors} accentColor={F.accent} sparkData={[130, 135, 132, 138, 140, 142]} 
        />
        <SparkKpiCard 
          label="Fichas Técnicas" value="89" delta={5} 
          icon={FileText} accentColor={F.accent} sparkData={[70, 75, 80, 82, 85, 89]} 
        />
        <SparkKpiCard 
          label="Tendencias" value="Top" delta={0} 
          icon={Sparkles} accentColor={F.accent} sparkData={[10, 20, 30, 40, 50, 60]} 
        />
      </div>

      {/* Grafico Adaptado */}
      <DashboardCharts rol="disenador" />

      {/* Listado de Diseños Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Aquí puedes poner una cuadrícula de imágenes de diseños recientes */}
          <div className="p-6 bg-white rounded-xl border border-fuchsia-100 min-h-[300px]">
             <h3 className="text-sm font-bold text-fuchsia-900 mb-4 flex items-center gap-2">
               <Palette size={16} /> Últimos Bocetos Subidos
             </h3>
             <div className="grid grid-cols-3 gap-4">
                {/* Placeholder para diseños */}
                {[1,2,3].map(i => (
                  <div key={i} className="aspect-square bg-fuchsia-50 rounded-lg border-2 border-dashed border-fuchsia-200 flex items-center justify-center">
                    <Upload size={24} className="text-fuchsia-300" />
                  </div>
                ))}
             </div>
          </div>
        </div>
        <RankingProductos data={[]} accentColor={F.accent} />
      </div>
    </DashboardSection>
  );
}
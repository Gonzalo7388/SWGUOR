"use client";

import React from 'react';
import { 
  Shirt, Sparkles, Upload, Scissors, 
  FileText, Palette, Plus, ChevronRight,
  Eye, Clock, CheckCircle2
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, RankingProductos } from './widgets/DashboardWidgets';
import { ROLE_PALETTES } from "./widgets/DashboardUtils";
import DashboardCharts from './DashboardCharts';

export default function DashboardDisenador() {
  const F = ROLE_PALETTES.disenador;

  // Datos de ejemplo para la galería
  const diseñosRecientes = [
    { id: 1, name: "Colección Invierno - Polos Oversize", status: "En Revisión", date: "Hace 2h" },
    { id: 2, name: "Vestido Gala Silk v2", status: "Aprobado", date: "Ayer" },
    { id: 3, name: "Línea Sport Tech-Wear", status: "Boceto", date: "Hace 3 días" },
  ];

  return (
    <DashboardSection 
      title="Estudio de Diseño" 
      role="disenador" 
      subtitle="Gestión de conceptos, moldaje y especificaciones técnicas"
    >
      <div className="space-y-6">
        
        {/* 1. KPIs Superiores de Creatividad y Desarrollo */}
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
            label="Eficiencia de Muestreo" value="92%" delta={3} 
            icon={Sparkles} accentColor={F.accent} sparkData={[80, 85, 82, 88, 90, 92]} 
          />
        </div>

        {/* 2. Gráfico de Tendencias y Producción */}
        <DashboardCharts rol="disenador" minimal />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Galería de Bocetos y Fichas (Columna Principal) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-fuchsia-100 rounded-[32px] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-fuchsia-950 uppercase tracking-widest">Mesa de Dibujo</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Últimos conceptos subidos al sistema</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-full text-[10px] font-black uppercase hover:bg-fuchsia-700 transition-colors">
                  <Plus size={14} /> Nuevo Diseño
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {diseñosRecientes.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-[3/4] bg-fuchsia-50 rounded-[24px] border-2 border-dashed border-fuchsia-100 flex flex-col items-center justify-center gap-3 group-hover:bg-fuchsia-100/50 transition-all cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-fuchsia-900/10 backdrop-blur-[2px] transition-all">
                         <div className="bg-white p-3 rounded-full shadow-xl text-fuchsia-600">
                            <Eye size={20} />
                         </div>
                      </div>
                      <Palette size={32} className="text-fuchsia-200 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black text-fuchsia-400 uppercase">Ver PDF / Imagen</span>
                    </div>
                    <div className="mt-3 px-1">
                      <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-bold text-fuchsia-600 uppercase tracking-tighter">{item.status}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listado de Tareas de Diseño */}
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pendientes de Escalado</h3>
               <div className="space-y-2">
                  {["Blusa Seda L-XL", "Jeans Hombre T32-34"].map((task, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <Scissors size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{task}</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* 4. Columna Derecha: Ranking y Estado de Colección */}
          <div className="space-y-6">
            <RankingProductos data={[]} accentColor={F.accent} />

            {/* Progreso de Colección Actual */}
            <div className="bg-[#1e1b4b] rounded-[32px] p-7 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-6">Temporada Verano 2024</h4>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-slate-300">Diseños Aprobados</span>
                      <span>18/25</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-slate-300">Fichas Técnicas</span>
                      <span>12/25</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                   <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                   </div>
                   <p className="text-[10px] font-medium text-slate-300 leading-tight">
                     Vas un <span className="text-white font-black">12% más rápido</span> que la temporada pasada.
                   </p>
                </div>
              </div>
              
              <Shirt className="absolute -bottom-10 -right-10 text-white/5 rotate-12" size={200} />
            </div>

            {/* Acceso Rápido a Materiales */}
            <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-[32px] p-6">
               <h4 className="text-[10px] font-black text-fuchsia-900 uppercase tracking-widest mb-4">Insumos Sugeridos</h4>
               <div className="flex flex-wrap gap-2">
                  {['Seda', 'Botón Nácar', 'Jersey 30/1', 'Rib'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white border border-fuchsia-200 text-fuchsia-700 rounded-full text-[9px] font-black uppercase">
                      {tag}
                    </span>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
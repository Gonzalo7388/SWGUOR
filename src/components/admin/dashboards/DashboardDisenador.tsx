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
import { cn } from '@/lib/utils';

export default function DashboardDisenador() {
  const F = ROLE_PALETTES.disenador;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/dashboard?role=disenador')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Mapeo de fichas reales
  const diseñosRecientes = data?.diseno?.fichas_recientes || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Palette className="animate-spin text-fuchsia-600" size={32} />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando estudio...</p>
      </div>
    );
  }

  return (
    <DashboardSection
      title="Estudio de Diseño"
      role="disenador"
      subtitle="Gestión de conceptos, moldaje y especificaciones técnicas"
    >
      <div className="space-y-8">

        {/* 1. KPIs Superiores — Diseño Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SparkKpiCard
            label="Nuevos Diseños" value={data?.diseno?.total_diseños ?? "0"} delta={15}
            icon={Shirt} accentColor={F.accent} sparkData={[5, 12, 8, 15, 20, 24]}
          />
          <SparkKpiCard
            label="Moldes Listos" value="142" delta={2}
            icon={Scissors} accentColor={F.accent} sparkData={[130, 135, 132, 138, 140, 142]}
          />
          <SparkKpiCard
            label="Fichas Técnicas" value={data?.kpis?.total_insumos ?? "0"} delta={5}
            icon={FileText} accentColor={F.accent} sparkData={[70, 75, 80, 82, 85, 89]}
          />
          <SparkKpiCard
            label="Eficiencia de Muestreo" value="92%" delta={3}
            icon={Sparkles} accentColor={F.accent} sparkData={[80, 85, 82, 88, 90, 92]}
          />
        </div>

        {/* 2. Gráfico de Tendencias */}
        <div className="bg-white rounded-[2.5rem] border border-fuchsia-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-fuchsia-950 uppercase tracking-tight">Evolución de Producción Creativa</h3>
          </div>
          <DashboardCharts rol="disenador" minimal />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 3. Galería de Bocetos (Columna Principal) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-fuchsia-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black text-fuchsia-950 uppercase tracking-widest">Mesa de Dibujo</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Últimos conceptos subidos al sistema</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-fuchsia-700 transition-all active:scale-95 shadow-lg shadow-fuchsia-100">
                  <Plus size={14} /> Nuevo Diseño
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {diseñosRecientes.map((item: any) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-[3/4] bg-fuchsia-50/50 rounded-[2rem] border-2 border-dashed border-fuchsia-100 flex flex-col items-center justify-center gap-3 group-hover:bg-fuchsia-100/50 transition-all cursor-pointer overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-fuchsia-900/20 backdrop-blur-[4px] transition-all duration-300">
                        <div className="bg-white p-4 rounded-full shadow-2xl text-fuchsia-600 scale-75 group-hover:scale-100 transition-transform">
                          <Eye size={24} />
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm text-fuchsia-300 group-hover:text-fuchsia-500 transition-colors">
                        <Palette size={24} />
                      </div>
                      <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">Previsualizar</span>
                    </div>
                    <div className="mt-4 px-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-black text-slate-900 truncate w-32">{item.prenda}</p>
                        <span className="text-[8px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase">v{item.version}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-tighter",
                          item.estado === 'aprobado' ? "text-emerald-500" : "text-fuchsia-600"
                        )}>{item.estado}</span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                          <Clock size={10} /> {new Date(item.fecha).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pendientes de Escalado */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.2em] mb-6">Próximos Escalados (Patronaje)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Blusa Seda L-XL", "Jeans Hombre T32-34"].map((task, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-500/20 rounded-2xl text-fuchsia-400 group-hover:scale-110 transition-transform">
                          <Scissors size={18} />
                        </div>
                        <span className="text-sm font-black tracking-tight">{task}</span>
                      </div>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
              <Sparkles className="absolute -bottom-10 -right-10 text-white/5" size={180} />
            </div>
          </div>

          {/* 4. Columna Derecha */}
          <div className="space-y-8">
            <RankingProductos data={[]} accentColor={F.accent} />

            {/* Progreso de Colección Actual */}
            <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[2.5rem] p-8 text-white relative shadow-xl">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-8">Temporada Verano 2024</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Diseños Aprobados</span>
                      <span className="text-fuchsia-400">18 / 25</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(192,38,211,0.5)]" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Fichas Técnicas</span>
                      <span className="text-emerald-400">12 / 25</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 leading-tight">
                    Ritmo operativo: <span className="text-white font-black">12% superior</span> al promedio histórico.
                  </p>
                </div>
              </div>

              <Shirt className="absolute -bottom-12 -right-12 text-white/5 rotate-12" size={220} />
            </div>

            {/* Insumos Sugeridos */}
            <div className="bg-white border border-fuchsia-100 rounded-[2.5rem] p-8 shadow-sm">
              <h4 className="text-[10px] font-black text-fuchsia-900 uppercase tracking-widest mb-6">Materiales en Tendencia</h4>
              <div className="flex flex-wrap gap-2">
                {['Seda Italiana', 'Botón Nácar', 'Jersey 30/1', 'Rib 2x1', 'Denim 12oz'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-fuchsia-50/50 border border-fuchsia-100 text-fuchsia-700 rounded-2xl text-[9px] font-black uppercase hover:bg-fuchsia-100 transition-colors cursor-pointer">
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
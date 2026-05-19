import React from 'react';
import { Truck, Clock, MapPin, CheckCircle2 } from "lucide-react";

interface Stats {
  total: number;
  preparando: number;
  transito: number;
  entregados: number;
}

interface DespachoStatsProps {
  stats: Stats;
  filtroActual: string;
  setFiltro: (filtro: string) => void;
}

const STATS_CONFIG = [
  { id: 'todos', title: 'TOTAL', key: 'total', icon: Truck, color: 'pink' },
  { id: 'preparando', title: 'PREPARANDO', key: 'preparando', icon: Clock, color: 'orange' },
  { id: 'transito', title: 'EN TRÁNSITO', key: 'transito', icon: MapPin, color: 'blue' },
  { id: 'entregado', title: 'ENTREGADOS', key: 'entregados', icon: CheckCircle2, color: 'emerald' },
];

export const DespachoStats = ({ stats, filtroActual, setFiltro }: DespachoStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS_CONFIG.map((conf) => {
        const Icon = conf.icon;
        const isActive = filtroActual === conf.id;
        
        return (
          <button
            key={conf.id}
            onClick={() => setFiltro(conf.id)}
            className={`group p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
              isActive 
                ? `ring-4 shadow-xl scale-[1.02] border-${conf.color}-500 ring-${conf.color}-50 bg-white` 
                : 'bg-white border-gray-100 shadow-sm hover:shadow-lg'
            }`}
          >
            <div className={`p-2 rounded-lg ${isActive ? `bg-${conf.color}-600 text-white` : 'bg-gray-100 text-gray-600'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{conf.title}</p>
              <p className={`text-xl font-black ${isActive ? `text-${conf.color}-600` : 'text-gray-800'}`}>
                {stats[conf.key as keyof Stats]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
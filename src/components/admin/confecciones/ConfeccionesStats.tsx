import React from 'react';
import { Zap, CheckCircle2, Clock } from 'lucide-react';

interface StatsProps {
  enProceso: number;
  completadas: number;
  promedio: number;
}

export const ConfeccionesStats = ({ enProceso, completadas, promedio }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard label="En Proceso" value={enProceso} icon={<Zap />} color="orange" />
      <KpiCard label="Completadas" value={completadas} icon={<CheckCircle2 />} color="emerald" />
      <KpiCard label="Progreso Promedio" value={`${promedio}%`} icon={<Clock />} color="blue" />
    </div>
  );
};

function KpiCard({ label, value, icon, color }: any) {
  const colors: any = {
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{value}</p>
    </div>
  );
}
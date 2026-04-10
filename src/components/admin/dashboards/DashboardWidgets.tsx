import React from 'react';
import { Sk } from './DashboardUtils';
import { ApiData, EstadoOrden } from './types';
import { ESTADOS_ORDEN } from '@/lib/constants/estados';

export function KpiCard({ label, value, icon: Icon, accentColor, loading, danger, subLabel }: {
  label: string; value: string | number; icon: React.ElementType;
  accentColor: string; loading: boolean; danger?: boolean; subLabel?: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accentColor }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-slate-50">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1.5">{label}</p>
      {loading
        ? <Sk className="h-9 w-24" />
        : <p className={`text-[2rem] font-black tracking-tighter leading-none ${danger ? 'text-rose-500' : 'text-slate-900'}`}
            style={{ fontFamily: "'Georgia', serif" }}>
            {value}
          </p>
      }
      {subLabel && !loading && (
        <p className="text-[10px] text-slate-400 mt-1.5">{subLabel}</p>
      )}
    </div>
  );
}

export function PipelineBar({ orders }: { orders: ApiData['recentOrders'] }) {
  const stages = (Object.entries(ESTADOS_ORDEN) as [EstadoOrden, { label: string; color: string; bgColor: string }][])
    .filter(([key]) => key !== 'cancelado')
    .map(([key, cfg]) => {
      const colorMap: Record<string, string> = {
        solicitado: '#3B82F6',
        cotizado:   '#9333EA',
        aprobado:   '#16A34A',
        pagado:     '#0D9488',
        en_proceso: '#EA580C',
        finalizado: '#0F766E',
      };
      return { key, label: cfg.label, color: colorMap[key] ?? '#94A3B8' };
    });

  const total = orders.filter(o => o.estado !== 'cancelado').length || 1;
  const cancelados = orders.filter(o => o.estado === 'cancelado').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Pipeline de Órdenes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Flujo operativo · {orders.length} total
            {cancelados > 0 && <span className="text-rose-400 ml-1">· {cancelados} cancelada{cancelados !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {stages.map((s) => {
          const count = orders.filter(o => o.estado === s.key).length;
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={s.key} className="text-center">
              <div className="h-14 bg-slate-50 rounded-xl relative flex items-end overflow-hidden mb-1.5">
                <div className="w-full rounded-xl transition-all duration-700"
                  style={{ height: `${Math.max(pct, 5)}%`, background: s.color, opacity: 0.85 }} />
              </div>
              <p className="text-xs font-black text-slate-800">{count}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-tight">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
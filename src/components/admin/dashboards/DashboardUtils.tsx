import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ESTADOS_ORDEN, ESTADOS_PAGO, PRIORIDADES_PEDIDO, TIPOS_CLIENTE } from '@/lib/constants/estados';
import { EstadoOrden } from './types';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function groupByDate(rows: { created_at: string; total: number }[]) {
  const acc: Record<string, number> = {};
  for (const r of rows) {
    const d = new Date(r.created_at).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short',
    });
    acc[d] = (acc[d] ?? 0) + Number(r.total);
  }
  return Object.entries(acc).map(([date, monto]) => ({ date, monto }));
}

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────
export const ESTADO_ICONS: Record<string, React.ReactNode> = {
  solicitado: <Clock size={11} />,
  cotizado:   <Clock size={11} />,
  aprobado:   <CheckCircle2 size={11} />,
  pagado:     <CheckCircle2 size={11} />,
  en_proceso: <AlertCircle size={11} />,
  finalizado: <CheckCircle2 size={11} />,
  cancelado:  <AlertCircle size={11} />,
};

export const toBadgeCls = (color: string, bgColor: string) =>
  `${bgColor.replace('100', '50')} ${color} border ${bgColor.replace('bg-', 'border-').replace('100', '200')}`;

export function getOrdenStatus(estado: string) {
  const key = estado?.toLowerCase() as EstadoOrden;
  const cfg  = ESTADOS_ORDEN[key];
  if (!cfg) return { label: estado ?? '—', cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: null };
  return { label: cfg.label, cls: toBadgeCls(cfg.color, cfg.bgColor), icon: ESTADO_ICONS[key] ?? null };
}

export function getPagoStatus(estado: string) {
  const cfg = ESTADOS_PAGO[estado?.toLowerCase()];
  if (!cfg) return { label: estado ?? '—', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
  return { label: cfg.label, cls: toBadgeCls(cfg.color, cfg.bgColor) };
}

export function getPrioridad(p: string) {
  const cfg = PRIORIDADES_PEDIDO[p?.toLowerCase()];
  if (!cfg) return { label: p ?? '—', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
  return { label: cfg.label, cls: toBadgeCls(cfg.color, cfg.bgColor) };
}

export function getTipoCliente(tipo: string) {
  const cfg = TIPOS_CLIENTE[tipo?.toLowerCase()];
  return cfg?.label ?? tipo ?? '—';
}

// ─── TOOLTIPS ─────────────────────────────────────────────────────────────────
export const AreaTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1B2A] border border-[#C9A86C]/20 rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-[10px] tracking-widest uppercase text-[#C9A86C] mb-0.5">{label}</p>
      <p className="text-white font-bold text-sm">S/ {Number(payload[0].value).toLocaleString('es-PE')}</p>
    </div>
  );
};

export const BarTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Producto</p>
      <p className="text-white text-xs font-medium mb-1.5 max-w-[180px]">{p.fullName}</p>
      <p className="text-[#C9A86C] font-bold text-sm">{p.sales} uds.</p>
    </div>
  );
};

// ─── SKELETON ────────────────────────────────────────────────────────────────
export const Sk = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} style={style} />
);
import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ESTADOS_ORDEN, ESTADOS_PAGO, PRIORIDADES_PEDIDO, TIPOS_CLIENTE } from '@/lib/constants/estados';
import type { EstadoOrden } from '@prisma/client';

export type RolPaleta = 
  | 'administrador' 
  | 'gerente' 
  | 'recepcionista' 
  | 'disenador' 
  | 'cortador' 
  | 'representante' 
  | 'ayudante';

export interface PaletaColors {
  accent: string;
  bg: string;
  bgSoft: string;
  border: string;
  text: string;
  mid: string;
}

// ─── PALETAS POR ROL ──────────────────────────────────────────────────────────
// Usadas para colorear skeletons, tooltips y widgets según el rol activo.

export const ROLE_PALETTES = {
  administrador: {
    accent: '#0369a1', bg: '#e0f2fe', bgSoft: '#f0f9ff',
    border: '#bae6fd', text: '#0c4a6e', mid: '#0284c7',
  },
  gerente: {
    accent: '#6d28d9', bg: '#ede9fe', bgSoft: '#f5f3ff',
    border: '#ddd6fe', text: '#2e1065', mid: '#7c3aed',
  },
  recepcionista: {
    accent: '#be185d', bg: '#fce7f3', bgSoft: '#fdf2f8',
    border: '#fbcfe8', text: '#500724', mid: '#db2777',
  },
  disenador: {
    accent: '#d946ef', bg: '#fae8ff', bgSoft: '#fdf4ff',
    border: '#f0abfc', text: '#701a75', mid: '#a21caf',
  },
  cortador: {
    accent: '#ea580c', bg: '#ffedd5', bgSoft: '#fff7ed',
    border: '#fed7aa', text: '#431407', mid: '#f97316',
  },
  ayudante: {
    accent: '#0f766e', bg: '#ccfbf1', bgSoft: '#f0fdfa',
    border: '#99f6e4', text: '#042f2e', mid: '#0d9488',
  },
  representante_taller: {
    accent: '#4d7c0f', bg: '#ecfccb', bgSoft: '#f7fee7',
    border: '#d9f99d', text: '#1a2e05', mid: '#65a30d',
  },
} as const;


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
export const AreaTip = ({ active, payload, label, accentColor = '#C9A86C' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1B2A] rounded-xl px-3 py-2.5 shadow-xl" style={{ border: `1px solid ${accentColor}33` }}>
      <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: accentColor }}>{label}</p>
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
export const Sk = ({ className = '', style, roleColor }: { className?: string; style?: React.CSSProperties; roleColor?: string }) => (
  <div
    className={`animate-pulse rounded-lg ${className}`}
    style={{ background: roleColor ?? '#f1f5f9', ...style }}
  />
);
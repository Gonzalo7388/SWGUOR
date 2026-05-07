import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ESTADOS_PEDIDO, ESTADOS_PAGO, PRIORIDADES_PEDIDO, TIPOS_CLIENTE } from '@/lib/constants/estados';
type EstadoPedido =
  | 'solicitado'
  | 'cotizado'
  | 'aprobado'
  | 'pagado'
  | 'en_proceso'
  | 'finalizado'
  | 'cancelado';

export interface PaletaColors {
  accent: string;
  bg: string;
  bgSoft: string;
  border: string;
  text: string;
  mid: string;
  primary: string;
  secondary: string;
  dark: string;
  cream: string;
  peach: string;
  beige: string;
  white: string;
}

export const COMPANY_PALETTE = {
  accent: '#E2725B',    // Terracota
  bg: '#FFFFFF',
  bgSoft: '#FAF7F2',    // Beige suave
  border: '#F2D2BD',    // Melocotón
  text: '#2B1B12',      // Café oscuro
  mid: '#C05A31',       // Arcilla
  primary: '#E2725B',    // Terracota
  secondary: '#C05A31',  // Arcilla
  dark: '#2B1B12',       // Café Oscuro
  cream: '#FFF9F2',      // Crema
  peach: '#F2D2BD',      // Melocotón
  beige: '#FAF7F2',      // Beige para detalles
  white: '#FFFFFF',     // Blanco Puro
};

export type RolPaleta = 
  | 'administrador' 
  | 'gerente' 
  | 'recepcionista' 
  | 'disenador' 
  | 'cortador' 
  | 'representante_taller' 
  | 'ayudante';

// ─── PALETAS POR ROL ──────────────────────────────────────────────────────────
// Usadas para colorear skeletons, tooltips y widgets según el rol activo.

export const ROLE_PALETTES: Record<RolPaleta, PaletaColors> = {
  administrador: COMPANY_PALETTE,
  gerente: COMPANY_PALETTE,
  recepcionista: COMPANY_PALETTE,
  disenador: COMPANY_PALETTE,
  cortador: COMPANY_PALETTE,
  ayudante: COMPANY_PALETTE,
  representante_taller: COMPANY_PALETTE,
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
  const key = estado?.toLowerCase() as EstadoPedido;
  const cfg  = ESTADOS_PEDIDO[key];
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
import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ESTADOS_PEDIDO, ESTADOS_PAGO, PRIORIDADES_PEDIDO, TIPOS_CLIENTE } from '@/lib/constants/estados';

type EstadoPedido =
  | 'solicitado' | 'cotizado' | 'aprobado' | 'pagado'
  | 'en_proceso' | 'finalizado' | 'cancelado';

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

// ─── PALETA ERP — profesional, sin cremas ─────────────────────────────────────
export const COMPANY_PALETTE = {
  accent:    '#1d3fa6',   // índigo principal
  bg:        '#ffffff',
  bgSoft:    '#f4f6f9',   // gris frío suave
  border:    '#d4dae5',   // gris neutro
  text:      '#0f172a',   // slate-900
  mid:       '#3358e8',   // índigo medio
  primary:   '#1d3fa6',
  secondary: '#3358e8',
  dark:      '#0f172a',
  cream:     '#f0f4ff',   // índigo 50 (reemplaza crema)
  peach:     '#e0e9ff',   // índigo 100 (reemplaza melocotón)
  beige:     '#f4f6f9',   // gris frío (reemplaza beige)
  white:     '#ffffff',
};

export type RolPaleta =
  | 'administrador' | 'gerente' | 'recepcionista'
  | 'disenador' | 'cortador' | 'representante_taller' | 'ayudante';

export const ROLE_PALETTES: Record<RolPaleta, PaletaColors> = {
  administrador:        COMPANY_PALETTE,
  gerente:              COMPANY_PALETTE,
  recepcionista:        COMPANY_PALETTE,
  disenador:            COMPANY_PALETTE,
  cortador:             COMPANY_PALETTE,
  ayudante:             COMPANY_PALETTE,
  representante_taller: COMPANY_PALETTE,
} as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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
  const cfg = ESTADOS_PEDIDO[key];
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
export const AreaTip = ({ active, payload, label, accentColor = '#1d3fa6' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0f172a',
        border: `1px solid ${accentColor}40`,
        borderRadius: 10,
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <p style={{ fontSize: 10, color: accentColor, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
        S/ {Number(payload[0].value).toLocaleString('es-PE')}
      </p>
    </div>
  );
};

export const BarTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '8px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <p style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 4 }}>Producto</p>
      <p style={{ color: '#fff', fontSize: 12, fontWeight: 500,
        marginBottom: 4, maxWidth: 180 }}>{p.fullName}</p>
      <p style={{ color: '#1d3fa6', fontWeight: 700, fontSize: 13 }}>{p.sales} uds.</p>
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export const Sk = ({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  roleColor?: string;   // mantenido por compatibilidad
}) => (
  <div
    className={`animate-pulse rounded-lg ${className}`}
    style={{ background: '#f4f6f9', border: '1px solid #d4dae5', ...style }}
  />
);
"use client";

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── PALETA LIMPIA ────────────────────────────────────────────────────────────
const C = {
  bg:       '#ffffff',
  surface:  '#f9fafb',   // gris muy suave
  border:   '#e5e7eb',   // gris medio
  text:     '#111827',   // casi negro
  muted:    '#6b7280',   // gris neutro
  accent:   '#1d3fa6',   // terracota (único color de marca)
  accentBg: '#f0f4ff',   // fondo suave del acento
  red:      '#ef4444',
  green:    '#10b981',
};

const cardStyle: React.CSSProperties = {
  background:   C.bg,
  border:       `1px solid ${C.border}`,
  borderRadius: 16,
  padding:      '20px 22px',
  boxShadow:    '0 1px 3px 0 rgb(0 0 0 / 0.07)',
  height:       '100%',
};

const titleStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2,
};

const subStyle: React.CSSProperties = {
  fontSize: 10, color: C.muted,
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
};

// ─── UTILIDAD: formato compacto ───────────────────────────────────────────────
export function fmtCompact(value: number): string {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `S/ ${(value / 1_000).toFixed(0)}k`;
  return `S/ ${value.toLocaleString('es-PE')}`;
}

// ─── 1. STAT CARD — sin sparkline, carga instantánea ─────────────────────────
export function SparkKpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accentColor = C.accent,
}: {
  label:        string;
  value:        string | number;
  delta:        number;
  icon:         React.ElementType;
  sparkData?:   number[];   // mantenido por compatibilidad, ignorado
  accentColor?: string;
}) {
  const isUp = delta >= 0;

  return (
    <div style={cardStyle}>
      {/* Ícono */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display:      'inline-flex',
          padding:      8,
          background:   C.surface,
          borderRadius: 10,
          border:       `1px solid ${C.border}`,
        }}>
          <Icon size={16} color={accentColor} />
        </div>
      </div>

      {/* Valor */}
      <div style={{
        fontSize: 26, fontWeight: 800, color: C.text,
        letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 4,
      }}>
        {value}
      </div>

      {/* Etiqueta */}
      <div style={subStyle}>{label}</div>

      {/* Delta */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: isUp ? C.green : C.red,
      }}>
        {isUp ? '↑' : '↓'} {Math.abs(delta)}%{' '}
        <span style={{ color: C.muted, fontWeight: 400 }}>vs mes ant.</span>
      </div>
    </div>
  );
}

// ─── 2. GRÁFICO DE VENTAS — eje Y con formato compacto ───────────────────────
export function VentasMensualesChart({
  data,
  accentColor = C.accent,
}: {
  data:          any[];
  accentColor?:  string;
}) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Ventas Mensuales</div>
      <div style={subStyle}>Tendencia de facturación</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={accentColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmtCompact(v).replace('S/ ', '')}
            tick={{ fontSize: 10, fill: C.muted }}
            axisLine={false} tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(v) => [fmtCompact(Number(v ?? 0)), 'Ventas']}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke={accentColor}
            fillOpacity={1}
            fill="url(#gradVentas)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: accentColor, stroke: C.bg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 3. RANKING DE PRODUCTOS ──────────────────────────────────────────────────
export function RankingProductos({
  data,
  accentColor = C.accent,
}: {
  data:         any[];
  accentColor?: string;
}) {
  const maxQ = Math.max(...(data?.map((d) => d.cantidad) ?? [1]), 1);

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Top Productos</div>
      <div style={subStyle}>Más pedidos</div>

      {(!data || data.length === 0) ? (
        <div style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: '20px 0' }}>
          Sin datos
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.map((p, i) => {
            const pct = (p.cantidad / maxQ) * 100;
            return (
              <div key={i}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, marginBottom: 5,
                }}>
                  <span style={{ color: C.text, fontWeight: 600, maxWidth: '70%',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i === 0 && (
                      <span style={{
                        display: 'inline-block', marginRight: 6,
                        fontSize: 9, fontWeight: 800, background: accentColor,
                        color: '#fff', borderRadius: 4, padding: '1px 5px',
                        verticalAlign: 'middle',
                      }}>
                        #1
                      </span>
                    )}
                    {p.nombre}
                  </span>
                  <span style={{ color: C.muted, fontWeight: 700, flexShrink: 0 }}>
                    {p.cantidad} u.
                  </span>
                </div>
                {/* Barra */}
                <div style={{
                  height: 5, background: C.surface,
                  borderRadius: 99, overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: i === 0 ? accentColor : C.border,
                    borderRadius: 99,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 4. ÚLTIMAS VENTAS ────────────────────────────────────────────────────────
export function UltimasVentas({
  data,
  accentColor = C.accent,
}: {
  data:         any[];
  accentColor?: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Ventas Recientes</div>
      <div style={subStyle}>Últimas transacciones</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data?.map((v, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 12px', background: C.surface, borderRadius: 10,
            border: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                {v.cliente || v.clientes?.razon_social}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                {new Date(v.created_at).toLocaleDateString('es-PE')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                {fmtCompact(Number(v.total || v.total_pagado || 0))}
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginTop: 2,
                color: v.estado === 'pagado' ? C.green : accentColor,
              }}>
                {v.estado}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. STOCK CRÍTICO ─────────────────────────────────────────────────────────
export function StockCriticoList({ data }: { data: any[] }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Stock Crítico</div>
      <div style={subStyle}>Insumos por agotarse</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data?.length === 0 ? (
          <div style={{ fontSize: 12, color: C.green, textAlign: 'center', padding: '12px 0' }}>
            Todo en orden ✓
          </div>
        ) : (
          data?.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px',
              background: '#fef2f2',
              borderRadius: 8,
              border: '1px solid #fecaca',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b',
                maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.nombre}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', flexShrink: 0 }}>
                {item.stock_actual} {item.unidad || item.unidad_medida}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── TOOLTIPS ─────────────────────────────────────────────────────────────────
export const AreaTip = ({ active, payload, label, accentColor = C.accent }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111827', borderRadius: 10,
      padding: '8px 12px', border: `1px solid ${accentColor}40`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <p style={{ fontSize: 10, color: accentColor, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
        {fmtCompact(Number(payload[0].value))}
      </p>
    </div>
  );
};

export const BarTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{
      background: '#111827', borderRadius: 10,
      padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 4 }}>Producto</p>
      <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, marginBottom: 4,
        maxWidth: 180 }}>{p.fullName}</p>
      <p style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{p.sales} uds.</p>
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
  roleColor?: string;
}) => (
  <div
    className={`animate-pulse rounded-lg ${className}`}
    style={{ background: C.surface, border: `1px solid ${C.border}`, ...style }}
  />
);
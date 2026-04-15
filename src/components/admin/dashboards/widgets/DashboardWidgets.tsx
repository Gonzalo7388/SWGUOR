"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie
} from 'recharts';

// ─── CONFIGURACIÓN VISUAL ──────────────────────────────────────────────────
const COLORS = {
  card: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  muted: '#94a3b8',
  mid: '#64748b',
  red: '#ef4444',
  amber: '#f59e0b',
};

const cardStyle: React.CSSProperties = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: '18px 20px',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  height: '100%'
};

const titleStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2,
};

const subStyle: React.CSSProperties = {
  fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14,
};

// ─── 1. SPARKLINE ANIMADO (Adaptable) ────────────────────────────────────────
export function AnimatedSparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 800, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, W, H);
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - 4 - ((v - min) / range) * (H - 8),
    }));
    const limit = Math.floor(pts.length * progress);
    if (limit < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < limit; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [progress, data, color]);

  return <canvas ref={canvasRef} width={80} height={30} style={{ display: 'block' }} />;
}

// ─── 2. TARJETA KPI (Dinámica) ───────────────────────────────────────────────
export function SparkKpiCard({ label, value, delta, icon: Icon, sparkData, accentColor = '#3b82f6' }: any) {
  const isUp = delta >= 0;
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ padding: 6, background: `${accentColor}10`, borderRadius: 8, border: `1px solid ${accentColor}20` }}>
          <Icon size={16} color={accentColor} />
        </div>
        <AnimatedSparkline data={sparkData || [0,0,0,0,0]} color={accentColor} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={subStyle}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: isUp ? '#10b981' : COLORS.red }}>
        {isUp ? '↑' : '↓'} {Math.abs(delta)}% <span style={{ color: COLORS.muted, fontWeight: 400 }}>vs mes ant.</span>
      </div>
    </div>
  );
}

// ─── 3. GRÁFICO DE VENTAS (Adaptable) ────────────────────────────────────────
export function VentasMensualesChart({ data, accentColor = '#3b82f6' }: { data: any[], accentColor?: string }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Ventas Mensuales</div>
      <div style={subStyle}>Tendencia de facturación (S/)</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
          <XAxis dataKey="mes" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey="ventas" stroke={accentColor} fillOpacity={1} fill="url(#colorVentas)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 4. RANKING DE PRODUCTOS (Adaptable) ─────────────────────────────────────
export function RankingProductos({ data, accentColor = '#3b82f6' }: { data: any[], accentColor?: string }) {
  const maxQ = Math.max(...(data?.map(d => d.cantidad) || [1]));
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Top Productos</div>
      <div style={subStyle}>Más vendidos</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data?.map((p, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: COLORS.mid, fontWeight: 500 }}>{p.nombre}</span>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>{p.cantidad} u.</span>
            </div>
            <div style={{ height: 6, background: COLORS.bg, borderRadius: 10 }}>
              <div style={{ 
                height: '100%', 
                width: `${(p.cantidad / maxQ) * 100}%`, 
                background: i === 0 ? COLORS.amber : accentColor,
                borderRadius: 10,
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. ÚLTIMAS VENTAS (Adaptable) ────────────────────────────────────────────
export function UltimasVentas({ data, accentColor = '#3b82f6' }: { data: any[], accentColor?: string }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Ventas Recientes</div>
      <div style={subStyle}>Últimas transacciones</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data?.map((v, i) => (
          <div key={i} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px', background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}`
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{v.cliente || v.clientes?.razon_social}</div>
              <div style={{ fontSize: 10, color: COLORS.muted }}>{new Date(v.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>S/ {v.total || v.total_pagado}</div>
              <div style={{ 
                fontSize: 9, 
                color: v.estado === 'pagado' ? '#10b981' : accentColor,
                textTransform: 'uppercase', fontWeight: 900
              }}>{v.estado}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. STOCK CRÍTICO (Diseño universal de alerta) ──────────────────────────
export function StockCriticoList({ data }: { data: any[] }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Stock Crítico</div>
      <div style={subStyle}>Insumos por agotarse</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data?.length === 0 ? (
          <div style={{ fontSize: 12, color: '#10b981', textAlign: 'center', padding: '10px' }}>Todo en orden</div>
        ) : (
          data?.map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#fff1f2', borderRadius: 8, border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9f1239' }}>{item.nombre}</span>
                <span style={{ fontSize: 11, color: '#e11d48', fontWeight: 800 }}>{item.stock_actual} {item.unidad || item.unidad_medida}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
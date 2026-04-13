'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, AlertTriangle, ShoppingCart,
  RefreshCw, Clock, CheckCircle2,
  AlertCircle, Eye, AlertOctagon,
} from 'lucide-react';
import { ESTADOS_ORDEN } from '@/lib/constants/estados';
import type { insumo, ordenes, EstadoOrden } from '@prisma/client';


type OrdenConCliente = ordenes & { clientes: { razon_social: string; tipo?: string } | null };

interface ApiData {
  kpis: {
    total_ventas: number;
    total_clientes: number;
    stock_alerta: number;
    nuevas_ordenes: number;
  };
  chartIngresos: { created_at: string; total: number }[];
  chartProductos: { cantidad: number; productos: { nombre: string } | null }[];
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}

// ─── PALETA ROL: ADMINISTRADOR — sky-100 / sky-700 ──────────────────────────
const ROLE_ACCENT   = '#0369a1'; // sky-700
const ROLE_BG       = '#e0f2fe'; // sky-100
const ROLE_BG_SOFT  = '#f0f9ff'; // sky-50
const ROLE_BORDER   = '#bae6fd'; // sky-200
const ROLE_TEXT     = '#0c4a6e'; // sky-900
const ROLE_MID      = '#0284c7'; // sky-600

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CHART_COLORS = [ROLE_ACCENT, '#6366F1', '#EC4899', '#0EA5E9', '#10B981'];

function groupByDate(rows: { created_at: string; total: number }[]) {
  const acc: Record<string, number> = {};
  for (const r of rows) {
    const d = new Date(r.created_at).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short',
    });
    acc[d] = (acc[d] ?? 0) + Number(r.total);
  }
  return Object.entries(acc).map(([date, monto]) => ({ date, monto }));
}

const ESTADO_ICONS: Record<string, React.ReactNode> = {
  solicitado: <Clock size={11} />,
  cotizado: <Clock size={11} />,
  aprobado: <CheckCircle2 size={11} />,
  pagado: <CheckCircle2 size={11} />,
  en_proceso: <AlertCircle size={11} />,
  finalizado: <CheckCircle2 size={11} />,
  cancelado: <AlertCircle size={11} />,
};

const toBadgeCls = (color: string, bgColor: string) =>
  `${bgColor.replace('100', '50')} ${color} border ${bgColor.replace('bg-', 'border-').replace('100', '200')}`;

function getOrdenStatus(estado: string) {
  const key = estado?.toLowerCase() as EstadoOrden;
  const cfg = ESTADOS_ORDEN[key];
  if (!cfg) return { label: estado ?? '—', cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: null };
  return { label: cfg.label, cls: toBadgeCls(cfg.color, cfg.bgColor), icon: ESTADO_ICONS[key] ?? null };
}

// ─── COMPONENTES ─────────────────────────────────────────────────────────────

const AreaTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: ROLE_TEXT, borderColor: `${ROLE_ACCENT}33` }} className="border rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: ROLE_BG }}>{label}</p>
      <p className="font-bold text-sm text-white">S/ {Number(payload[0].value).toLocaleString('es-PE')}</p>
    </div>
  );
};

const Sk = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: ROLE_BG, ...style }} />
);

function KpiCard({ label, value, icon: Icon, accentColor, loading, danger, subLabel }: any) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border shadow-sm overflow-hidden" style={{ borderColor: ROLE_BORDER }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accentColor ?? ROLE_ACCENT }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: ROLE_BG_SOFT }}>
          <Icon className="w-4 h-4" style={{ color: ROLE_ACCENT }} />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: ROLE_MID }}>{label}</p>
      {loading ? <Sk className="h-9 w-24" /> : (
        <p className={`text-[2rem] font-black tracking-tighter leading-none ${danger ? 'text-rose-500' : ''}`}
          style={!danger ? { color: ROLE_TEXT } : undefined}>
          {value}
        </p>
      )}
      {subLabel && !loading && <p className="text-[10px] mt-1.5" style={{ color: ROLE_MID }}>{subLabel}</p>}
    </div>
  );
}

function PipelineBar({ orders }: { orders: OrdenConCliente[] }) {
  const stages = (Object.entries(ESTADOS_ORDEN) as [EstadoOrden, any][])
    .filter(([key]) => key !== 'cancelado')
    .map(([key, cfg]) => {
      const colorMap: Record<string, string> = {
        solicitado: '#3B82F6', cotizado: '#9333EA', aprobado: '#16A34A',
        pagado: '#0D9488', en_proceso: '#EA580C', finalizado: '#0F766E',
      };
      return { key, label: cfg.label, color: colorMap[key] ?? '#94A3B8' };
    });

  const total = orders.filter(o => o.estado !== 'cancelado').length || 1;
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5" style={{ borderColor: ROLE_BORDER }}>
      <div className="mb-4">
        <h2 className="text-sm font-black tracking-tight" style={{ color: ROLE_TEXT }}>Pipeline de Órdenes</h2>
        <p className="text-xs mt-0.5" style={{ color: ROLE_MID }}>Flujo operativo en tiempo real</p>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {stages.map((s) => {
          const count = orders.filter(o => o.estado === s.key).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={s.key} className="text-center">
              <div className="h-14 rounded-xl relative flex items-end overflow-hidden mb-1.5" style={{ background: ROLE_BG_SOFT }}>
                <div className="w-full transition-all duration-700"
                  style={{ height: `${Math.max(pct, 5)}%`, background: s.color, opacity: 0.85 }} />
              </div>
              <p className="text-xs font-black" style={{ color: ROLE_TEXT }}>{count}</p>
              <p className="text-[9px] font-medium mt-0.5 leading-tight" style={{ color: ROLE_MID }}>{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [filter, setFilter] = useState('30');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?days=${filter}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 p-6 text-center">
      <AlertOctagon className="w-8 h-8 text-rose-400" />
      <h2 className="font-bold" style={{ color: ROLE_TEXT }}>Error en el panel</h2>
      <button onClick={() => fetchData()} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: ROLE_ACCENT }}>
        Reintentar
      </button>
    </div>
  );

  const salesChart = data ? groupByDate(data.chartIngresos ?? []) : [];
  const topProducts = (data?.chartProductos ?? []).map((p, i) => ({
    name: (p.productos?.nombre ?? 'Producto').split(' ').slice(0, 2).join(' '),
    sales: p.cantidad,
    pct: Math.round((p.cantidad / Math.max(...(data?.chartProductos.map(x => x.cantidad) ?? [1]))) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROLE_MID }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: ROLE_ACCENT }} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ROLE_MID }}>En vivo · Sistema GUOR</p>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: ROLE_TEXT }}>Panel Ejecutivo</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(true)}
            className="p-2 rounded-xl border bg-white"
            style={{ borderColor: ROLE_BORDER, color: ROLE_MID }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-white border rounded-xl p-0.5 gap-0.5" style={{ borderColor: ROLE_BORDER }}>
            {['7', '30', '90'].map((d) => (
              <button key={d} onClick={() => setFilter(d)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all"
                style={filter === d
                  ? { background: ROLE_TEXT, color: ROLE_BG }
                  : { color: ROLE_MID }}>
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Facturación" value={`S/ ${Number(data?.kpis.total_ventas ?? 0).toLocaleString('es-PE')}`} icon={TrendingUp} loading={loading} />
        <KpiCard label="Clientes" value={data?.kpis.total_clientes ?? 0} icon={Users} loading={loading} />
        <KpiCard label="Alertas Stock" value={data?.kpis.stock_alerta ?? 0} icon={AlertTriangle} loading={loading} danger={Number(data?.kpis.stock_alerta) > 0} />
        <KpiCard label="Órdenes" value={data?.kpis.nuevas_ordenes ?? 0} icon={ShoppingCart} loading={loading} />
      </div>

      {/* PIPELINE */}
      {loading ? <Sk className="h-32 w-full" /> : <PipelineBar orders={data?.recentOrders ?? []} />}

      {/* CHARTS */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border p-6" style={{ borderColor: ROLE_BORDER }}>
          <h2 className="text-sm font-black mb-4" style={{ color: ROLE_TEXT }}>Rendimiento Financiero</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ROLE_ACCENT} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={ROLE_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={ROLE_BG} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: ROLE_MID }} axisLine={false} />
                <YAxis axisLine={false} tick={{ fontSize: 10, fill: ROLE_MID }} tickFormatter={(v) => `S/${v}`} />
                <Tooltip content={<AreaTip />} />
                <Area type="monotone" dataKey="monto" stroke={ROLE_ACCENT} fill="url(#skyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded-2xl p-6 text-white" style={{ background: ROLE_TEXT }}>
          <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: ROLE_BG }}>Ranking Ventas</h2>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-bold w-4 text-sm" style={{ color: ROLE_BG }}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-[11px] font-bold truncate">{p.name}</p>
                  <div className="h-1 rounded-full mt-1" style={{ background: `${ROLE_ACCENT}33` }}>
                    <div className="h-1 rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                </div>
                <span className="font-bold text-sm" style={{ color: p.color }}>{p.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border p-6" style={{ borderColor: ROLE_BORDER }}>
          <h2 className="text-sm font-black mb-4" style={{ color: ROLE_TEXT }}>Órdenes Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="uppercase tracking-widest font-black text-[9px]" style={{ color: ROLE_MID }}>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders ?? []).slice(0, 5).map((o) => {
                  const st = getOrdenStatus(o.estado ?? '');
                  return (
                    <tr key={o.id} className="transition-colors" style={{ background: ROLE_BG_SOFT }}>
                      <td className="p-3 rounded-l-xl font-bold italic" style={{ color: ROLE_MID }}>#{String(o.id).padStart(5, '0')}</td>
                      <td className="p-3 font-bold" style={{ color: ROLE_TEXT }}>{o.clientes?.razon_social}</td>
                      <td className="p-3 font-black" style={{ color: ROLE_TEXT }}>S/ {Number(o.total_pagado).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg font-black text-[9px] border ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="p-3 rounded-r-xl text-right">
                        <Eye size={14} style={{ color: ROLE_MID }} className="inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border p-6" style={{ borderColor: ROLE_BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black" style={{ color: ROLE_TEXT }}>Alertas Stock</h2>
            <AlertTriangle size={14} style={{ color: ROLE_ACCENT }} />
          </div>
          <div className="space-y-3">
            {(data?.criticalStock ?? []).map((item) => {
              const pct = Math.min(Math.round((item.stock_actual / item.stock_minimo) * 100), 100);
              return (
                <div key={item.id} className="p-3 border rounded-xl" style={{ background: ROLE_BG_SOFT, borderColor: ROLE_BORDER }}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="truncate mr-2" style={{ color: ROLE_TEXT }}>{item.nombre}</span>
                    <span style={{ color: ROLE_ACCENT }}>{item.stock_actual} {item.unidad_medida}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: ROLE_BG }}>
                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: ROLE_ACCENT }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
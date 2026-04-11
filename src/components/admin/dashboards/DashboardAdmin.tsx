'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, Users, AlertTriangle, ShoppingCart, RefreshCw, 
  Package, CheckCircle2, AlertCircle, ArrowRight, Eye, Calendar, ChevronDown
} from 'lucide-react';

// Modulares locales
import { ApiData } from './types';
import { groupByDate, AreaTip, getOrdenStatus, getTipoCliente, Sk } from './DashboardUtils';
import { KpiCard, PipelineBar } from './DashboardWidgets';
import { UNIDADES_MEDIDA } from '@/lib/constants/estados';

export default function AdminDashboard() {
  const [filter,     setFilter]     = useState('30');
  const [data,       setData]       = useState<ApiData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res  = await fetch(`/api/admin/dashboard?days=${filter}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      console.error('Dashboard:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpis         = data?.kpis;
  const salesChart   = data ? groupByDate(data.chartIngresos ?? []) : [];
  const CHART_COLORS = ['#C9A86C', '#6366F1', '#EC4899', '#0EA5E9', '#10B981'];
  
  const topProducts  = (data?.chartProductos ?? []).map((p, i) => {
    const max = Math.max(...(data?.chartProductos ?? []).map(x => x.cantidad), 1);
    return {
      name:     (p.productos?.nombre ?? 'Producto').split(' ').slice(0, 2).join(' '),
      fullName: p.productos?.nombre ?? 'Producto',
      sales:    p.cantidad,
      pct:      Math.round((p.cantidad / max) * 100),
      color:    CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const orders        = data?.recentOrders  ?? [];
  const criticalStock = data?.criticalStock ?? [];

  return (
    <div className="w-full space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              En vivo · GUOR v2
            </p>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none"
            style={{ fontFamily: "'Georgia', serif" }}>
            Panel Ejecutivo B2B
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modas Estilos GUOR S.A.C. · Filtrando por:{' '}
            <strong className="text-[#C9A86C]">
              {filter === '7D' ? 'Últimos 7 días' : 
               filter === '30D' ? 'Últimos 30 días' : 
               filter === '90D' ? 'Últimos 90 días' :
               filter === 'THIS_MONTH' ? 'Este Mes' :
               filter === 'LAST_MONTH' ? 'Mes Pasado' :
               filter === 'THIS_YEAR' ? 'Este Año' : 'Histórico Completo'}
            </strong>
          </p>
        </div>
        
        {/* NUEVO FILTRO DE FECHA */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => fetchData(true)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative flex items-center bg-[#0D1B2A] border border-[#0D1B2A] rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <Calendar className="w-4 h-4 text-[#C9A86C] mr-2.5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-white outline-none appearance-none pr-6 cursor-pointer w-[140px]"
            >
              <option value="7D" className="bg-slate-800 text-white">Últimos 7 Días</option>
              <option value="30D" className="bg-slate-800 text-white">Últimos 30 Días</option>
              <option value="90D" className="bg-slate-800 text-white">Últimos 90 Días</option>
              
              <option disabled className="bg-slate-900 text-slate-500 font-bold">── MENSUAL ──</option>
              
              <option value="THIS_MONTH" className="bg-slate-800 text-white">Este Mes</option>
              <option value="LAST_MONTH" className="bg-slate-800 text-white">Mes Pasado</option>
              
              <option disabled className="bg-slate-900 text-slate-500 font-bold">── ANUAL ──</option>
              
              <option value="THIS_YEAR" className="bg-slate-800 text-white">Este Año</option>
              <option value="ALL" className="bg-slate-800 text-white">Histórico</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Facturación B2B" value={`S/ ${Number(kpis?.total_ventas ?? 0).toLocaleString('es-PE')}`}
          icon={TrendingUp} accentColor="linear-gradient(90deg,#C9A86C,#E8C98A)" loading={loading} subLabel="Ingresos del período" />
        <KpiCard label="Clientes Activos" value={Number(kpis?.total_clientes ?? 0)}
          icon={Users} accentColor="linear-gradient(90deg,#6366F1,#818CF8)" loading={loading} subLabel="Cuentas corporativas" />
        <KpiCard label="Alertas Stock" value={Number(kpis?.stock_alerta ?? 0)} icon={AlertTriangle}
          accentColor={Number(kpis?.stock_alerta) > 0 ? 'linear-gradient(90deg,#F43F5E,#FB7185)' : 'linear-gradient(90deg,#10B981,#34D399)'}
          loading={loading} danger={Number(kpis?.stock_alerta) > 0} subLabel="Insumos bajo mínimo" />
        <KpiCard label="Órdenes del Período" value={Number(kpis?.nuevas_ordenes ?? 0)}
          icon={ShoppingCart} accentColor="linear-gradient(90deg,#0EA5E9,#38BDF8)" loading={loading} subLabel="Pedidos registrados" />
      </div>

      {/* ── PIPELINE ───────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <Sk className="h-5 w-48 mb-4" />
          <div className="grid grid-cols-6 gap-2">
            {[70, 50, 85, 40, 60, 30].map((h, i) => (
              <div key={i} className="text-center">
                <div className="h-14 bg-slate-50 rounded-xl overflow-hidden flex items-end mb-1.5">
                  <Sk className="w-full" style={{ height: `${h}%` }} />
                </div>
                <Sk className="h-3 w-6 mx-auto mb-1" />
                <Sk className="h-2.5 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : <PipelineBar orders={orders} />}

      {/* ── CHARTS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 min-w-0">
        
        {/* Área ventas */}
        <div className="col-span-12 lg:col-span-8 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-50">
            <div>
              <h2 className="text-sm font-black text-slate-800">Rendimiento Financiero</h2>
              <p className="text-xs text-slate-400 mt-0.5">Facturación B2B acumulada · últimos {filter} días</p>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0">
              En Vivo
            </span>
          </div>
          <div className="h-[240px] px-3 py-4">
            {loading ? (
              <div className="h-full flex items-end gap-1.5 pb-2 px-2">
                {[55, 80, 45, 90, 70, 60, 85, 50, 75, 65].map((h, i) => (
                  <div key={i} className="flex-1 animate-pulse bg-slate-100 rounded-t-md" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : salesChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                Sin movimientos en este período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9A86C" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C9A86C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`} width={48} />
                  <Tooltip content={<AreaTip />} />
                  <Area type="monotone" dataKey="monto" stroke="#C9A86C" strokeWidth={2.5} fill="url(#gold)"
                    dot={{ r: 3, fill: '#C9A86C', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#C9A86C' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ranking productos */}
        <div className="col-span-12 lg:col-span-4 min-w-0 bg-[#0D1B2A] rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 pt-5 pb-3 border-b border-white/[0.06]">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Ranking Ventas</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Top productos por unidades</p>
          </div>
          <div className="flex-1 px-5 py-4 space-y-3.5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-white/5 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 rounded bg-white/5 animate-pulse w-3/4" />
                      <div className="h-1.5 rounded bg-white/5 animate-pulse" />
                    </div>
                    <div className="w-7 h-3 rounded bg-white/5 animate-pulse" />
                  </div>
                ))
              : topProducts.length === 0
                ? <p className="text-slate-600 text-sm text-center pt-6">Sin datos disponibles</p>
                : topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2.5">
                      <span className="text-base font-black text-[#1E2F42] w-4 shrink-0 tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-300 truncate">{p.name}</p>
                        <div className="mt-1 h-1 bg-white/[0.06] rounded-full">
                          <div className="h-1 rounded-full transition-all duration-700"
                            style={{ width: `${p.pct}%`, background: p.color }} />
                        </div>
                      </div>
                      <span className="text-sm font-black shrink-0" style={{ color: p.color }}>{p.sales}</span>
                    </div>
                  ))
            }
          </div>
          <div className="px-5 py-3 border-t border-white/[0.06] text-center">
            <p className="text-[9px] uppercase tracking-widest text-slate-600">Período: {filter} días</p>
          </div>
        </div>
      </div>

      {/* ── ÓRDENES + STOCK ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 min-w-0">

        {/* Órdenes recientes */}
        <div className="col-span-12 lg:col-span-8 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-800">Órdenes Recientes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Últimos pedidos B2B del sistema</p>
            </div>
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-slate-300 text-sm">Sin órdenes en este período</div>
          ) : (
            <table className="w-full table-fixed text-left border-separate border-spacing-y-1.5">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[28%]" />
                <col className="w-[17%]" />
                <col className="w-[25%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr>
                  {['ID', 'Cliente', 'Total', 'Estado', 'Tipo', ''].map((h) => (
                    <th key={h} className="px-2 pb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest first:pl-5 last:pr-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const st   = getOrdenStatus(o.estado ?? '');
                  const tipo = getTipoCliente((o.clientes as any)?.tipo ?? '');
                  return (
                    <tr key={o.id} className="group">
                      <td className="py-2.5 pl-5 bg-slate-50 group-hover:bg-slate-100 rounded-l-xl transition-colors">
                        <span className="text-[11px] font-black text-slate-600 italic">#{String(o.id).padStart(5, '0')}</span>
                      </td>
                      <td className="py-2.5 px-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {o.clientes?.razon_social ?? 'Consumidor'}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <span className="text-xs font-black text-slate-800">
                          S/ {Number(o.total_pagado ?? 0).toLocaleString('es-PE')}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black border ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        {tipo && tipo !== '—' && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {tipo}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-5 bg-slate-50 group-hover:bg-slate-100 rounded-r-xl transition-colors text-right">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all">
                          <Eye size={13} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Insight: órdenes pendientes */}
          {!loading && orders.filter(o => o.estado === 'solicitado').length > 0 && (
            <div className="mx-5 mb-4 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2.5">
              <AlertCircle size={13} className="text-blue-500 shrink-0" />
              <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                {orders.filter(o => o.estado === 'solicitado').length} orden
                {orders.filter(o => o.estado === 'solicitado').length !== 1 ? 'es' : ''} pendiente
                {orders.filter(o => o.estado === 'solicitado').length !== 1 ? 's' : ''} — requieren cotización
              </p>
            </div>
          )}
        </div>

        {/* Stock crítico */}
        <div className="col-span-12 lg:col-span-4 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-800">Alertas de Inventario</h2>
              <p className="text-xs text-slate-400 mt-0.5">Insumos bajo nivel mínimo</p>
            </div>
            <div className="p-1.5 bg-amber-50 rounded-xl">
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
          </div>

          <div className="px-5 py-4 space-y-2.5 flex-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-14 w-full" />)
            ) : criticalStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <p className="text-slate-400 text-xs text-center font-medium">Inventario en niveles correctos</p>
              </div>
            ) : (
              criticalStock.map((item) => {
                const pct  = item.stock_minimo > 0
                  ? Math.min(Math.round((item.stock_actual / item.stock_minimo) * 100), 100)
                  : 100;
                const crit = pct < 30;
                const unidadLabel = UNIDADES_MEDIDA[item.unidad_medida ?? '']?.label ?? item.unidad_medida ?? '';
                return (
                  <div key={item.id}
                    className={`rounded-xl px-3.5 py-2.5 border ${crit ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Package size={12} className={`shrink-0 ${crit ? 'text-rose-400' : 'text-amber-400'}`} />
                        <p className="text-xs font-bold text-slate-700 truncate">{item.nombre}</p>
                      </div>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${
                        crit ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.stock_actual} {unidadLabel}
                      </span>
                    </div>
                    <div className={`h-1 rounded-full ${crit ? 'bg-rose-100' : 'bg-amber-100'}`}>
                      <div className={`h-1 rounded-full transition-all ${crit ? 'bg-rose-400' : 'bg-amber-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-[9px] mt-1 ${crit ? 'text-rose-400' : 'text-amber-500'}`}>
                      Mín: {item.stock_minimo} {unidadLabel} · {pct}% disponible
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {!loading && criticalStock.length > 0 && (
            <div className="px-5 pb-4">
              <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
                Reponer Inventario <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
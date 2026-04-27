"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Users, AlertTriangle, ShoppingCart, 
  RefreshCw, AlertOctagon 
} from 'lucide-react';
import { DashboardSection } from './DashboardSection';
import { SparkKpiCard, StockCriticoList } from './widgets/DashboardWidgets';
import DashboardCharts from './DashboardCharts';
import { ROLE_PALETTES } from './widgets/DashboardUtils';
import type { insumo, ordenes_compra } from '@prisma/client';

type OrdenConCliente = ordenes_compra & { clientes: { razon_social: string; tipo?: string } | null }; 

interface ApiData {
  kpis: {
    total_ventas: number;
    total_clientes: number;
    stock_alerta: number;
    nuevas_ordenes: number;
  };
  recentOrders: OrdenConCliente[];
  criticalStock: insumo[];
}

export default function DashboardAdministrador() {
  const [filter, setFilter] = useState('30');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const A = ROLE_PALETTES.administrador;

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
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
      <h2 className="font-bold text-slate-800">Error en el panel</h2>
      <p className="text-xs text-slate-500">{error}</p>
      <button
        onClick={() => fetchData()}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-700"
      >
        Reintentar
      </button>
    </div>
  );

  // FIX: normalize con fallbacks para que nada sea undefined
  const kpis          = data?.kpis;
  const recentOrders  = data?.recentOrders  ?? [];   // ← siempre array
  const criticalStock = data?.criticalStock ?? [];   // ← siempre array

  return (
    <DashboardSection title="Panel de Administración" role="administrador">

      {/* Botones de Filtro */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <button
          onClick={() => fetchData(true)}
          className="p-2 rounded-xl border bg-white text-slate-400 hover:text-sky-600 transition-colors"
          style={{ borderColor: A.border }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex bg-white border rounded-xl p-0.5 gap-0.5" style={{ borderColor: A.border }}>
          {['7', '30', '90'].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all"
              style={filter === d ? { background: A.text, color: '#fff' } : { color: A.accent }}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* KPIs — FIX: delta y sparkData siempre presentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SparkKpiCard
          label="Ventas"
          value={kpis ? `S/ ${Number(kpis.total_ventas).toLocaleString('es-PE')}` : '—'}
          delta={0}
          sparkData={[0, 0, 0, 0, 0]}
          icon={TrendingUp}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Clientes"
          value={kpis?.total_clientes ?? '—'}
          delta={0}
          sparkData={[0, 0, 0, 0, 0]}
          icon={Users}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Órdenes"
          value={kpis?.nuevas_ordenes ?? '—'}
          delta={0}
          sparkData={[0, 0, 0, 0, 0]}
          icon={ShoppingCart}
          accentColor={A.accent}
        />
        <SparkKpiCard
          label="Alertas Stock"
          value={kpis?.stock_alerta ?? '—'}
          delta={0}
          sparkData={[0, 0, 0, 0, 0]}
          icon={AlertTriangle}
          accentColor={A.mid}
        />
      </div>

      <DashboardCharts rol="administrador" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: A.border }}>
            <h2 className="text-sm font-black mb-4 text-slate-800">Órdenes Recientes</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4 text-xs text-slate-400 animate-pulse">
                  Cargando órdenes...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Sin órdenes recientes
                </div>
              ) : (
                // FIX: recentOrders ya es siempre un array gracias al fallback de arriba
                recentOrders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-[10px] font-black text-sky-700">
                        #{String(o.id).padStart(5, '0')}
                      </p>
                      <p className="text-xs font-bold text-slate-800 truncate w-32">
                        {o.clientes?.razon_social ?? 'S/N'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">
                        S/ {Number(o.total_pagado ?? 0).toFixed(2)}
                      </p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        {o.estado}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* FIX: criticalStock siempre es array, nunca undefined */}
          <StockCriticoList data={criticalStock} />
        </div>
      </div>

    </DashboardSection>
  );
}
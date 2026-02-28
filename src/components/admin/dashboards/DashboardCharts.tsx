"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 1. DEFINICIÓN DE INTERFAZ PARA EVITAR ERRORES DE TYPESCRIPT
interface DashboardChartsProps {
  minimal?: boolean;
}

export default function DashboardCharts({ minimal = false }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30');
  const [activeTab, setActiveTab] = useState('ventas');

  const [ventasData, setVentasData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [ordenesEstado, setOrdenesEstado] = useState<any[]>([]);
  const [comparativa, setComparativa] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/charts?days=${timeFilter}`);
      const data = await response.json();

      setVentasData(data.ventasData || []);
      setTopProducts(data.topProducts || []);
      setOrdenesEstado(data.ordenesEstado || []);
      setComparativa(data.comparativaData || []);
    } catch (error: any) {
      console.error("Error cargando gráficas:", error.message);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => { if (isMounted) fetchData(); }, [isMounted, fetchData]);

  if (!isMounted) return null;

  // --- VISTA MINIMALISTA (Para el Dashboard del Ayudante) ---
  if (minimal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-slate-400" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendimiento Semanal</h4>
        </div>
        <div className="h-40 w-full bg-white/5 rounded-2xl p-2 border border-white/10">
          {loading ? (
            <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold text-slate-500 animate-pulse">Sincronizando...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasData.slice(-7)}>
                <Area type="monotone" dataKey="ventas" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip content={<CustomTooltip dark />} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  // --- VISTA COMPLETA (Para el Dashboard de Admin / Analítica) ---
  const tabs = [
    { id: 'ventas', label: 'Ventas' },
    { id: 'productos', label: 'Productos' },
    { id: 'ordenes', label: 'Órdenes' },
    { id: 'comparativa', label: 'Comparativa' }
  ];

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Analítica Avanzada</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Reportes de rendimiento GUOR</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white shadow-sm border p-1 rounded-2xl">
            {['7', '30', '90'].map(d => (
              <button key={d} onClick={() => setTimeFilter(d)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeFilter === d ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {d} Días
              </button>
            ))}
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] rounded-2xl h-11 px-6 gap-2">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </div>

      {/* TABS ESTILIZADOS */}
      <div className="flex gap-8 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 font-black uppercase text-[10px] tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Procesando base de datos...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'ventas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-black uppercase text-slate-800 tracking-tight">Flujo de Ingresos</h3>
                  <span className="text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-tighter">↑ +12.5% vs mes anterior</span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={ventasData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="ventas" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="meta" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                <StatCard label="Total Ventas" value="S/ 28,640" trend={12.5} icon={<TrendingUp />} />
                <StatCard label="Promedio Diario" value="S/ 4,091" trend={8.3} icon={<ShoppingCart />} />
                <StatCard label="Eficiencia" value="96.4%" trend={false} icon={<Package />} />
              </div>
            </div>
          )}

          {/* ... El resto de los tabs seguirían la misma lógica de diseño ... */}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES ---

function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        {trend && (
          <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-900'} text-white p-4 rounded-2xl shadow-2xl text-[10px] font-bold uppercase border`}>
        <p className="mb-2 opacity-50">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: entry.color}} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
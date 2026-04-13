"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Label
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_PALETTES, type RolPaleta } from './DashboardUtils';

// 1. DEFINICIÓN DE INTERFAZ PARA EVITAR ERRORES DE TYPESCRIPT
interface DashboardChartsProps {
  minimal?: boolean;
  /** Rol activo — colorea el gráfico minimal con la paleta del rol */
  rol?: RolPaleta;
}

export default function DashboardCharts({ minimal = false, rol }: DashboardChartsProps) {
  const roleP = rol ? ROLE_PALETTES[rol] : null;
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

  // --- VISTA MINIMALISTA (Ayudante, Representante, Diseñador, Cortador…) ---
  if (minimal) {
    const strokeColor = roleP?.accent ?? '#6366f1';
    const labelColor  = roleP ? roleP.bg : 'rgba(255,255,255,0.5)';
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} style={{ color: roleP?.mid ?? '#94a3b8' }} />
          <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: labelColor }}>
            Rendimiento Semanal
          </h4>
        </div>
        <div className="h-40 w-full rounded-2xl p-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold animate-pulse" style={{ color: labelColor }}>
              Sincronizando...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasData.slice(-7)}>
                <Area type="monotone" dataKey="ventas" stroke={strokeColor} fill={strokeColor} fillOpacity={0.1} strokeWidth={2} />
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
                  <div>
                    <h3 className="font-black uppercase text-slate-800 tracking-tight text-lg">Flujo de Ingresos</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Comparativa de ventas vs meta</p>
                  </div>
                  <span className="text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-emerald-100">↑ +12.5% vs mes anterior</span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={ventasData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} 
                      axisLine={false} 
                      tickLine={false}
                      dy={10}
                    >
                      <Label value="Período (Días)" position="bottom" offset={10} fill="#64748b" fontSize={12} fontWeight={600} />
                    </XAxis>
                    <YAxis 
                      tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
                    >
                      <Label value="Monto (S/)" angle={-90} position="insideLeft" style={{textAnchor: 'middle'}} fill="#64748b" fontSize={12} fontWeight={600} />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="#f43f5e" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 7, strokeWidth: 1 }}
                      name="Ventas Reales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#cbd5e1" 
                      strokeWidth={2.5} 
                      strokeDasharray="8 8" 
                      dot={false}
                      name="Meta Esperada"
                    />
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
    <div className="bg-white p-7 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 transition-colors">
          {icon}
        </div>
        {trend !== false && (
          <div className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border ${
            trend > 0 
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
              : 'text-rose-600 bg-rose-50 border-rose-100'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">{label}</p>
        <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'} text-white p-4 rounded-2xl shadow-2xl border min-w-[200px]`}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <div className="space-y-2 border-t border-slate-700 pt-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{backgroundColor: entry.color}} 
                />
                <span className="text-[9px] uppercase font-bold text-slate-300">{entry.name}</span>
              </div>
              <span className="text-sm font-black text-white">
                {entry.name.includes('Meta') ? entry.value : `S/${(entry.value/1000).toFixed(1)}k`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
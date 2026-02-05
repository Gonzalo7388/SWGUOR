"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardCharts() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30');
  const [activeTab, setActiveTab] = useState('ventas');

  // Datos de ejemplo - Reemplazar con datos reales de API
  const [ventasData, setVentasData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [inventarioData, setInventarioData] = useState<any[]>([]);
  const [ordenesEstado, setOrdenesEstado] = useState<any[]>([]);
  const [comparativa, setComparativa] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await fetch(`/api/admin/charts?days=${timeFilter}`);
      const data = await response.json();

      if (data.error) {
        console.warn("Error en API, usando datos fallback");
      }

      setVentasData(data.ventasData || []);
      setTopProducts(data.topProducts || []);
      setInventarioData(data.inventarioData || []);
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

  const tabs = [
    { id: 'ventas', label: 'Ventas' },
    { id: 'productos', label: 'Productos' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'ordenes', label: 'Órdenes' },
    { id: 'comparativa', label: 'Comparativa' }
  ];

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Analítica Avanzada</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reportes y análisis de datos</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white shadow-sm border p-1 rounded-2xl">
            {['7', '30', '90'].map(d => (
              <button key={d} onClick={() => setTimeFilter(d)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeFilter === d ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                {d} Días
              </button>
            ))}
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-bold uppercase text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-center h-96">
          <p className="text-slate-400 font-bold text-sm uppercase animate-pulse">Cargando gráficas...</p>
        </div>
      ) : (
        <>
          {/* TAB: VENTAS */}
          {activeTab === 'ventas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black uppercase text-slate-800">Flujo de Ventas</h3>
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full">↑ +12.5%</span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={ventasData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" stroke="#f43f5e" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="meta" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <StatCard label="Total Ventas" value="S/ 28,640" trend={12.5} icon={<TrendingUp />} />
                <StatCard label="Promedio Diario" value="S/ 4,091" trend={8.3} icon={<ShoppingCart />} />
                <StatCard label="Meta Cumplida" value="96.4%" trend={false} />
              </div>
            </div>
          )}

          {/* TAB: PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="font-black uppercase text-slate-800 mb-6">Top 5 Productos Vendidos</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="nombre" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ventas" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="font-black uppercase text-slate-800 mb-6">Categorías Más Vendidas</h3>
                <div className="space-y-3">
                  {[
                    { cat: 'Prendas', pct: 45 },
                    { cat: 'Accesorios', pct: 28 },
                    { cat: 'Calzado', pct: 18 },
                    { cat: 'Otros', pct: 9 }
                  ].map(item => (
                    <div key={item.cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{item.cat}</span>
                        <span className="text-xs font-bold text-slate-900">{item.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-linear-to-r from-rose-500 to-rose-600 h-2 rounded-full" style={{width: `${item.pct}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVENTARIO */}
          {activeTab === 'inventario' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="font-black uppercase text-slate-800 mb-6">Niveles de Stock</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={inventarioData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="semana" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="alto" fill="#10b981" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="medio" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="bajo" fill="#ef4444" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <InventoryAlert label="Stock Bajo" count="12 productos" color="rose" />
                <InventoryAlert label="Stock Crítico" count="3 productos" color="red" />
                <InventoryAlert label="En Stock Óptimo" count="48 productos" color="emerald" />
              </div>
            </div>
          )}

          {/* TAB: ÓRDENES */}
          {activeTab === 'ordenes' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-center">
                <div style={{width: '100%', height: 350}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordenesEstado}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ordenesEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                {ordenesEstado.map((estado, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: estado.color}} />
                      <span className="font-bold text-slate-700 uppercase text-sm">{estado.name}</span>
                    </div>
                    <span className="font-black text-2xl text-slate-900">{estado.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COMPARATIVA */}
          {activeTab === 'comparativa' && (
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="font-black uppercase text-slate-800 mb-6">Análisis de Ingresos vs Gastos</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparativa}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="gastos" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="ganancia" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Sub-componentes
function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center justify-between mt-3">
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryAlert({ label, count, color }: any) {
  const colors: any = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  };

  return (
    <div className={`p-6 rounded-3xl border-2 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-2xl font-black mt-2">{count}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl text-[10px] font-bold uppercase">
        <p className="mb-1 opacity-60">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{color: entry.color}}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

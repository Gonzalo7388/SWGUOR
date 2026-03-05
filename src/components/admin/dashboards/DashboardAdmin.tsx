"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, Label
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Insumo } from '@/types';

// Widgets optimizados
import RecentOrdersTable from './widgets/RecentOrdersTable';
import StockAlertCard from './widgets/StockAlertCard';

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30');
  
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalClientes: 0,
    stockBajo: 0,
    pedidosNuevos: 0
  });

  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [criticalStock, setCriticalStock] = useState<Insumo[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?days=${timeFilter}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setStats({
        totalVentas: Number(data.kpis.total_ventas) || 0,
        totalClientes: Number(data.kpis.total_clientes) || 0,
        stockBajo: Number(data.kpis.stock_alerta) || 0,
        pedidosNuevos: Number(data.kpis.nuevas_ordenes) || 0
      });

      // Procesamiento optimizado de gráfica
      const groupedSales = (data.chartIngresos || []).reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
        const found = acc.find((item: any) => item.date === date);
        found ? found.monto += Number(curr.total) : acc.push({ date, monto: Number(curr.total) });
        return acc;
      }, []);
      
      setSalesChart(groupedSales);

      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];
      setTopProducts((data.chartProductos || []).map((p: any, i: number) => ({
        name: p.productos?.nombre?.split(' ')[0] || 'Prod', 
        sales: p.cantidad,
        fullValue: p.productos?.nombre,
        color: colors[i % colors.length]
      })));

      setRecentOrders(data.recentOrders || []);
      setCriticalStock(data.criticalStock || []);
    } catch (error: any) {
      console.error("Error Dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => { if (isMounted) fetchData(); }, [isMounted, fetchData]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 font-sans">
      
      {/* HEADER DINÁMICO */}
      <header className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Inteligencia de Negocio v2.0
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">CONTROL MAESTRO</h1>
            <p className="text-slate-500 text-sm font-medium">Sistema de monitoreo integral de operaciones</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm h-fit">
            {['7', '30', '90'].map(d => (
              <button key={d} onClick={() => setTimeFilter(d)}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${timeFilter === d ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>
                {d} D
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI GRID CON GRADIENTES SUTILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Ingresos Totales" value={`S/ ${stats.totalVentas.toLocaleString()}`} color="indigo" icon={TrendingUp} />
        <KpiCard title="Cartera Clientes" value={stats.totalClientes} color="blue" icon={Users} />
        <KpiCard title="Alertas Stock" value={stats.stockBajo} color="orange" isAlert={stats.stockBajo > 0} icon={AlertTriangle} />
        <KpiCard title="Órdenes Mes" value={stats.pedidosNuevos} color="emerald" icon={ShoppingCart} />
      </div>

      {/* SECCIÓN PRINCIPAL DE ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRÁFICA DE VENTAS (MÁS ANCHA) */}
        <section className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Rendimiento Financiero</h3>
              <p className="text-slate-400 text-xs font-medium">Comparativa de ingresos por periodo seleccionado</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              En Vivo
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {loading ? (
              <ChartLoader label="Sincronizando transacciones..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  >
                    <Label value="Período (Días)" position="bottom" offset={10} fill="#64748b" fontSize={12} fontWeight={600} />
                  </XAxis>
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}}
                    tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
                  >
                    <Label value="Ingresos (S/)" angle={-90} position="insideLeft" style={{textAnchor: 'middle'}} fill="#64748b" fontSize={12} fontWeight={600} />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fill="url(#colorSales)" 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* TOP PRODUCTOS (ESTILO DARK COMPACTO) */}
        <section className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold uppercase text-sm tracking-widest text-white">Ranking Ventas</h3>
          </div>

          <div className="flex-1 min-h-[300px]">
            {loading ? (
              <ChartLoader dark label="Analizando demanda..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}}
                    tickFormatter={(v) => `${v} und.`}
                  >
                    <Label value="Cantidad de Unidades" position="bottom" offset={10} fill="#94a3b8" fontSize={11} fontWeight={600} />
                  </XAxis>
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 800}} 
                    width={95}
                  >
                    <Label value="Productos" angle={-90} position="insideLeft" style={{textAnchor: 'middle'}} fill="#94a3b8" fontSize={10} fontWeight={600} />
                  </YAxis>
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip dark />} />
                  <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={24}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase text-center">Datos basados en {timeFilter} días de actividad</p>
          </div>
        </section>

        {/* TABLAS Y ALERTAS */}
        <div className="lg:col-span-4">
          <StockAlertCard items={criticalStock} />
        </div>

        <div className="lg:col-span-8">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

function KpiCard({ title, value, color, isAlert, icon: Icon }: any) {
  const colorMap: any = { 
    indigo: 'border-indigo-100 bg-indigo-50/30', 
    blue: 'border-blue-100 bg-blue-50/30', 
    emerald: 'border-emerald-100 bg-emerald-50/30', 
    orange: 'border-orange-100 bg-orange-50/30' 
  };

  return (
    <div className={`group bg-white p-6 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isAlert ? 'border-rose-100 bg-rose-50/50 shadow-md' : colorMap[color] + ' shadow-sm'}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const productName = payload[0].payload.fullValue || label;
    return (
      <div className={`${
        dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      } p-4 rounded-2xl shadow-2xl border min-w-[180px]`}>
        <p className={`text-[9px] font-black uppercase mb-3 tracking-wider ${
          dark ? 'text-slate-400' : 'text-slate-500'
        }`}>Producto</p>
        <p className={`text-[11px] font-bold mb-3 ${
          dark ? 'text-slate-300' : 'text-slate-700'
        }`}>{productName}</p>
        <div className="border-t" style={{ borderColor: dark ? '#334155' : '#e2e8f0' }} />
        <div className="mt-3 flex items-center gap-2">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: payload[0].color || payload[0].payload.color }}
          />
          <div>
            <p className={`text-[8px] ${
              dark ? 'text-slate-500' : 'text-slate-400'
            } uppercase font-bold tracking-wider`}>Cantidad</p>
            <p className={`text-sm font-black ${
              dark ? 'text-white' : 'text-slate-900'
            }`}>{value} unidades</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ChartLoader = ({ label, dark }: { label: string, dark?: boolean }) => (
  <div className="h-full w-full flex flex-col items-center justify-center gap-4">
    <div className={`w-10 h-10 border-4 ${dark ? 'border-slate-700 border-t-indigo-500' : 'border-slate-100 border-t-indigo-600'} rounded-full animate-spin`} />
    <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
  </div>
);
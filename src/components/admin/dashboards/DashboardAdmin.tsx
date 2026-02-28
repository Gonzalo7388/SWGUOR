"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, ShoppingCart, 
  Package, Trophy, ArrowUpRight, Calendar,
  LayoutDashboard, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">CONTROL MAESTRO</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Inteligencia de Negocio v2.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <Calendar size={14} className="ml-2 text-slate-400" />
          {['7', '30', '90'].map(d => (
            <button key={d} onClick={() => setTimeFilter(d)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${timeFilter === d ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
              {d} Días
            </button>
          ))}
        </div>
      </header>

      {/* KPI GRID CON GRADIENTES SUTILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Ingresos Totales" value={`S/ ${stats.totalVentas.toLocaleString()}`} icon={<TrendingUp />} color="indigo" />
        <KpiCard title="Cartera Clientes" value={stats.totalClientes} icon={<Users />} color="blue" />
        <KpiCard title="Alertas Stock" value={stats.stockBajo} icon={<Package />} color="orange" isAlert={stats.stockBajo > 0} />
        <KpiCard title="Órdenes Mes" value={stats.pedidosNuevos} icon={<ShoppingCart />} color="emerald" />
      </div>

      {/* SECCIÓN PRINCIPAL DE ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRÁFICA DE VENTAS (MÁS ANCHA) */}
        <section className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp size={120} />
          </div>
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Rendimiento Financiero</h3>
              <p className="text-slate-400 text-xs font-medium">Comparativa de ingresos por periodo seleccionado</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
              <ArrowUpRight size={14} /> En Vivo
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {loading ? (
              <ChartLoader label="Sincronizando transacciones..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="monto" stroke="#6366f1" strokeWidth={3} fill="url(#colorSales)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* TOP PRODUCTOS (ESTILO DARK COMPACTO) */}
        <section className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <Trophy className="text-yellow-400" size={20} />
              </div>
              <h3 className="font-bold uppercase text-sm tracking-widest text-white">Ranking Ventas</h3>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {loading ? (
              <ChartLoader dark label="Analizando demanda..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} width={70} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} content={<CustomTooltip dark />} />
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

function KpiCard({ title, value, icon, color, isAlert }: any) {
  const colorMap: any = { 
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
    blue: 'bg-blue-50 text-blue-600 border-blue-100', 
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    orange: 'bg-orange-50 text-orange-600 border-orange-100' 
  };

  return (
    <div className={`group bg-white p-6 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isAlert ? 'border-rose-100 bg-rose-50/30' : 'border-transparent shadow-sm'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${colorMap[color] || colorMap.indigo}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          {isAlert && <AlertCircle size={16} className="text-rose-500 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-2xl shadow-2xl border min-w-[140px]`}>
        <p className={`text-[10px] font-black uppercase mb-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label || payload[0].payload.fullValue}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].payload.color }} />
          <p className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
            {dark ? `${payload[0].value} Unidades` : `S/ ${payload[0].value.toLocaleString()}`}
          </p>
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
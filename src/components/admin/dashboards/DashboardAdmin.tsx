"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, ShoppingCart, 
  Package, Trophy, ArrowUpRight 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
import { Venta, Inventario } from '@/types/database';

// Imports de tus componentes
import RecentOrdersTable from './widgets/RecentOrdersTable';
import StockAlertCard from './widgets/StockAlertCard';
import DashboardCharts from './DashboardCharts';

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
  const [criticalStock, setCriticalStock] = useState<Inventario[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Llamada a la API que modificamos anteriormente
      const response = await fetch(`/api/admin/dashboard?days=${timeFilter}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // 1. SINCRONIZACIÓN DE KPIs: Usamos los nombres exactos de la respuesta del servidor
      setStats({
          totalVentas: Number(data.kpis.total_ventas) || 0,
          totalClientes: Number(data.kpis.total_clientes) || 0,
          stockBajo: Number(data.kpis.stock_alerta) || 0,
          pedidosNuevos: Number(data.kpis.nuevas_ordenes) || 0
        });

      // 2. PROCESAMIENTO DE GRÁFICA DE INGRESOS
      const groupedSales = (data.chartIngresos || []).reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString('es-PE', { 
          day: '2-digit', 
          month: 'short' 
        });
        const found = acc.find((item: any) => item.date === date);
        if (found) { 
          found.monto += Number(curr.total); 
        } else { 
          acc.push({ date, monto: Number(curr.total) });
        }
        return acc;
      }, []);
      
      setSalesChart(groupedSales);

      // 3. PROCESAMIENTO DE TOP PRODUCTOS
      const colors = ['#f43f5e', '#fb923c', '#38bdf8', '#818cf8', '#2dd4bf'];
      const productsData = (data.chartProductos || []).map((p: any, index: number) => ({
        name: p.productos?.nombre || 'Producto', // Acceso correcto al objeto anidado
        sales: p.cantidad,
        color: colors[index % colors.length]
      }));
      setTopProducts(productsData);

      // 4. DATOS DE TABLAS Y WIDGETS (Vienen directos de la nueva API)
      setRecentOrders(data.recentOrders || []);
      setCriticalStock(data.criticalStock || []);

    } catch (error: any) {
      console.error("Error cargando Dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => { if (isMounted) fetchData(); }, [isMounted, fetchData]);

  // Prevenir desajustes de hidratación en Next.js
  if (!isMounted) return null;

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Control Maestro</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Panel de Inteligencia GUOR</p>
        </div>
        <div className="flex bg-white shadow-sm border p-1 rounded-2xl">
          {['7', '30', '90'].map(d => (
            <button key={d} onClick={() => setTimeFilter(d)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeFilter === d ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              {d} Días
            </button>
          ))}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard title="Ventas Totales" value={`S/ ${stats.totalVentas}`} icon={<TrendingUp />} color="rose" />
        <KpiCard title="Clientes" value={stats.totalClientes} icon={<Users />} color="blue" />
        <KpiCard title="Stock Alerta" value={stats.stockBajo} icon={<Package />} color="orange" isAlert={stats.stockBajo > 0} />
        <KpiCard title="Nuevas Órdenes" value={stats.pedidosNuevos} icon={<ShoppingCart />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRÁFICA DE VENTAS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black uppercase text-slate-800">Flujo de Ingresos</h3>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full">
              <ArrowUpRight size={14} />
              <span>Actualizado</span>
            </div>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse text-slate-400 font-bold text-xs uppercase">Calculando Gráfica...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="monto" stroke="#f43f5e" strokeWidth={4} fill="url(#colorMonto)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICA DE PRODUCTOS */}
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="text-yellow-400" size={20} />
            <h3 className="font-black uppercase tracking-tighter">Top Productos</h3>
          </div>
          <div className="h-64 w-full">
            {loading ? (
               <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase italic">Analizando Inventario...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} width={80} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip dark />} />
                  <Bar dataKey="sales" radius={[0, 10, 10, 0]} barSize={20}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* WIDGETS */}
        <div className="lg:col-span-1">
          <StockAlertCard items={criticalStock} />
        </div>

        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}

// Sub-componentes
function KpiCard({ title, value, icon, color, isAlert }: any) {
  const colors: any = { 
    rose: 'bg-rose-50 text-rose-600', 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    orange: 'bg-orange-50 text-orange-600' 
  };
  return (
    <div className={`bg-white p-6 rounded-4xl border-2 transition-all ${isAlert ? 'border-orange-200 shadow-lg shadow-orange-100' : 'border-transparent shadow-sm'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} p-3 rounded-xl shadow-2xl text-[10px] font-bold uppercase`}>
        <p className="mb-1 opacity-60">{label}</p>
        <p className="text-sm">{dark ? `${payload[0].value} Unidades` : `S/ ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export function AdminDashboardWithCharts() {
  return (
    <div className="space-y-8">
      <AdminDashboard />
      <DashboardCharts />
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Package, Activity, DollarSign, ChevronRight, 
  BarChart3, TrendingUp, Download, Calendar, Filter,
  ArrowUpRight, Target, Briefcase, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { toast } from 'sonner';
import { ROLE_PALETTES } from "./DashboardUtils";

// ─── CONFIGURACIÓN DE ESTILO: GERENTE (Violet/Indigo) ──────────────────────
const G = {
  primary: ROLE_PALETTES.gerente?.accent || '#6d28d9', // violet-700
  dark:    ROLE_PALETTES.gerente?.text   || '#2e1065', // violet-950
  light:   ROLE_PALETTES.gerente?.bgSoft || '#f5f3ff', // violet-50
  mid:     ROLE_PALETTES.gerente?.bg     || '#ede9fe', // violet-100
  border:  ROLE_PALETTES.gerente?.border || '#ddd6fe', // violet-200
  accent:  '#7c3aed' // violet-600
};

export default function GerenteDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30');
  const [exportando, setExportando] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard?days=${periodo}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error("Error al sincronizar métricas globales");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleExportarInforme = async () => {
    setExportando(true);
    // Simulación de delay de generación de reporte
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Informe Gerencial generado con éxito");
    setExportando(false);
  };

  if (loading && !data) return <LoadingState />;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 min-h-screen" style={{ background: G.light }}>
      
      {/* HEADER EJECUTIVO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ background: G.primary }}>
              Admin View
            </span>
            <span className="text-[10px] font-bold text-violet-400">v2.4.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#2e1065] leading-none">
            Control Center
          </h1>
          <p className="font-medium text-violet-600 mt-2 flex items-center gap-2">
            Supervisión global de operaciones y rendimiento financiero
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border" style={{ borderColor: G.border }}>
            {['7', '30', '90'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  periodo === p ? 'text-white' : 'text-violet-400 hover:text-violet-600'
                }`}
                style={periodo === p ? { background: G.primary } : {}}
              >
                {p}D
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportarInforme}
            disabled={exportando}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-violet-200 rounded-2xl text-xs font-black text-violet-700 hover:bg-violet-50 transition-all shadow-sm"
          >
            {exportando ? <Zap className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            INFORME
          </button>
        </div>
      </header>

      {/* KPI GRID: CRITICAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Revenue Bruto" value={`S/ ${data?.kpis.total_ventas?.toLocaleString()}`} trend="+12.5%" icon={DollarSign} color={G.primary} />
        <KpiCard title="Orders Active" value={data?.kpis.nuevas_ordenes} trend="+5" icon={Package} color="#2563eb" />
        <KpiCard title="Eficiencia Taller" value={`${data?.kpis.eficiencia_taller}%`} trend="+2.1%" icon={Activity} color="#059669" />
        <KpiCard title="New Leads" value={data?.kpis.total_clientes} trend="+3.8%" icon={Users} color="#db2777" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: SUPERVISIÓN DE ÁREAS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm border-violet-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">Estado de Áreas</h3>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <div className="w-1 h-1 rounded-full bg-yellow-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <RoleLink label="Diseño & Patronaje" role="Diseñador" status="Active" href="/admin/dashboard/disenador" />
              <RoleLink label="Mesa de Corte" role="Cortador" status="In Progress" href="/admin/dashboard/cortador" />
              <RoleLink label="Recepción Central" role="Recepcionista" status="Active" href="/admin/dashboard/recepcionista" />
              <RoleLink label="Suministros" role="Ayudante" status="Active" href="/admin/dashboard/ayudante" />
              <RoleLink label="External Shop" role="Taller" status="Alert" href="/admin/dashboard/representante_taller" isAlert />
            </div>
          </div>

          {/* QUICK ANALYTICS: TARGETS */}
          <div className="bg-[#2e1065] rounded-[2.5rem] p-8 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-black uppercase tracking-widest">Objetivo Mensual</h3>
             </div>
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span>Producción</span>
                    <span>84%</span>
                  </div>
                  <div className="h-2 w-full bg-violet-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
                <p className="text-xs text-violet-300 leading-relaxed font-medium">
                  Faltan 156 prendas para alcanzar la meta de facturación del Q2.
                </p>
             </div>
          </div>
        </div>

        {/* PANEL DERECHO: RENDIMIENTO & VOLUMEN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* GRÁFICO PRINCIPAL */}
          <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm border-violet-200">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-black text-[#2e1065]">Flujo de Ingresos</h3>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Análisis de los últimos 7 días</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-2xl">
                <TrendingUp className="text-violet-600" />
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DUMMY_DATA}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={G.primary} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={G.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f3ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a78bfa', fontSize: 10, fontWeight: 700}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke={G.primary} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MINI GRID: OPERATIONAL INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-violet-600 rounded-[2rem] p-6 text-white flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase opacity-60">Tiempo Promedio Entrega</p>
                  <p className="text-2xl font-black">4.2 Días</p>
               </div>
               <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
               </div>
            </div>
            <div className="bg-white border border-violet-200 rounded-[2rem] p-6 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase text-violet-400">Costo Operativo</p>
                  <p className="text-2xl font-black text-[#2e1065]">S/ 12,400</p>
               </div>
               <div className="h-12 w-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                  <Briefcase className="w-6 h-6" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTES ATÓMICOS ───────────────────────────────────────────────────

function KpiCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-md" style={{ borderColor: G.border }}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 rounded-2xl" style={{ background: `${color}15` }}>
          <Icon size={24} style={{ color: color }} />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black">
          <ArrowUpRight size={12} /> {trend}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-400 mb-1">{title}</p>
      <p className="text-3xl font-black tracking-tighter text-[#2e1065]">{value}</p>
    </div>
  );
}

function RoleLink({ label, role, href, status, isAlert }: any) {
  return (
    <a href={href} className="flex items-center justify-between p-4 rounded-2xl border transition-all hover:translate-x-1 bg-white group"
      style={{ borderColor: isAlert ? '#fecaca' : G.border }}>
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-rose-500 animate-pulse' : 'bg-green-500'}`} />
        <div>
          <p className="text-xs font-black text-[#2e1065] uppercase tracking-tight">{label}</p>
          <p className="text-[10px] font-bold text-violet-400">{role}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-violet-200 group-hover:text-violet-500 transition-colors" />
    </a>
  );
}

function LoadingState() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-violet-50 gap-4">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-700 animate-pulse">Establishing Secure Uplink</p>
    </div>
  );
}

const DUMMY_DATA = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mie', sales: 2000 },
  { name: 'Jue', sales: 2780 },
  { name: 'Vie', sales: 1890 },
  { name: 'Sab', sales: 2390 },
  { name: 'Dom', sales: 3490 },
];
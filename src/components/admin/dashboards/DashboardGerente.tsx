"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Users, Package, Activity, 
  DollarSign, ChevronRight, BarChart3 
} from 'lucide-react';
import { toast } from 'sonner';

export default function GerenteDashboard() {
  const [metrics, setMetrics] = useState({
    totalVentas: 0,
    pedidosActivos: 0,
    eficienciaTaller: 0,
    clientesNuevos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGerenteData() {
      try {
        const supabase = getSupabaseBrowserClient();
        // Simulación de carga de métricas globales
        const { data: pedidos } = await supabase.from('pedidos').select('id', { count: 'exact' });
        
        setMetrics({
          totalVentas: 187450, // Ejemplo
          pedidosActivos: pedidos?.length || 0,
          eficienciaTaller: 92,
          clientesNuevos: 12
        });
      } catch (e) {
        toast.error("Error al cargar métricas gerenciales");
      } finally {
        setLoading(false);
      }
    }
    loadGerenteData();
  }, []);

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Control Gerencial</h1>
          <p className="text-slate-500 font-medium">Supervisión global de operaciones y rendimiento</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-xs font-bold text-slate-600">
          Periodo: Marzo 2026
        </div>
      </header>

      {/* Métricas Críticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Ingresos Mensuales" value={`S/ ${metrics.totalVentas}`} trend="+12.5%" icon={DollarSign} color="emerald" />
        <KpiCard title="Pedidos en Curso" value={metrics.pedidosActivos} trend="+5" icon={Package} color="blue" />
        <KpiCard title="Eficiencia Operativa" value={`${metrics.eficienciaTaller}%`} trend="+2.1%" icon={Activity} color="pink" />
        <KpiCard title="Nuevos Clientes" value={metrics.clientesNuevos} trend="+3" icon={Users} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acceso rápido a Dashboards de Rol */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Supervisión por Área</h3>
          <div className="space-y-3">
            <RoleLink label="Área de Diseño" role="Diseñador" href="/admin/dashboard/disenador" status="En línea" />
            <RoleLink label="Taller de Corte" role="Cortador" href="/admin/dashboard/cortador" status="Activo" />
            <RoleLink label="Atención al Cliente" role="Recepcionista" href="/admin/dashboard/recepcionista" status="En línea" />
            <RoleLink label="Logística Interna" role="Ayudante" href="/admin/dashboard/ayudante" status="Activo" />
            <RoleLink label="Gestión de Taller" role="Rep. Taller" href="/admin/dashboard/representante_taller" status="Pendiente" />
          </div>
        </div>

        {/* Gráfico Simple / Resumen de Actividad */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold">Rendimiento de Producción</h3>
              <p className="text-slate-400 text-sm">Comparativa semanal de salida de prendas</p>
            </div>
            <BarChart3 className="text-pink-500 w-8 h-8" />
          </div>
          <div className="h-64 flex items-end gap-4 justify-between">
            {/* Representación visual de barras simple */}
            {[45, 60, 85, 70, 95, 50, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-800 rounded-t-xl relative overflow-hidden group">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-pink-600 to-pink-400 transition-all duration-1000" 
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500">D{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    pink: 'text-pink-600 bg-pink-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}><Icon size={20} /></div>
        <span className="text-xs font-black text-emerald-500">{trend}</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{title}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function RoleLink({ label, role, href, status }: any) {
  return (
    <a href={href} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-pink-100 hover:bg-pink-50/30 transition-all group">
      <div>
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400">{role}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black uppercase text-slate-300 group-hover:text-pink-500 transition-colors">{status}</span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-pink-500" />
      </div>
    </a>
  );
}
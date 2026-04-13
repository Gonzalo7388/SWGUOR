"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Package, Activity, DollarSign, ChevronRight, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

// ─── PALETA ROL: GERENTE — violet-100 / violet-700 ───────────────────────────
const ROLE_ACCENT  = '#6d28d9'; // violet-700
const ROLE_BG      = '#ede9fe'; // violet-100
const ROLE_BG_SOFT = '#f5f3ff'; // violet-50
const ROLE_BORDER  = '#ddd6fe'; // violet-200
const ROLE_TEXT    = '#2e1065'; // violet-950 (muy oscuro)
const ROLE_MID     = '#7c3aed'; // violet-600

export default function GerenteDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('30');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard?days=${filter}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (error) {
      toast.error("Error al cargar datos reales");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) return <div className="p-10 text-center">Cargando métricas reales...</div>;

  return (
    <div className="p-8 space-y-10 min-h-screen" style={{ background: ROLE_BG_SOFT }}>
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: ROLE_TEXT }}>
            Panel de Control Gerencial
          </h1>
          <p className="font-medium mt-1" style={{ color: ROLE_MID }}>
            Supervisión global de operaciones y rendimiento
          </p>
        </div>
        <div className="p-3 rounded-2xl border text-xs font-bold bg-white" style={{ borderColor: ROLE_BORDER, color: ROLE_MID }}>
          Periodo: Marzo 2026
        </div>
      </header>

      {/* Métricas Críticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Ingresos Mensuales" value={`S/ ${data?.kpis.total_ventas}`} trend="+12.5%" icon={DollarSign} />
        <KpiCard title="Pedidos en Curso"   value={data?.kpis.nuevas_ordenes}      trend="+5"     icon={Package}     />
        <KpiCard title="Eficiencia Operativa" value={`${data?.kpis.eficiencia_taller}%`} trend="+2.1%" icon={Activity} />
        <KpiCard title="Nuevos Clientes"    value={data?.kpis.total_clientes}      trend="+3"     icon={Users}       />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Supervisión por Área */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: ROLE_MID }}>
            Supervisión por Área
          </h3>
          <div className="space-y-3">
            <RoleLink label="Área de Diseño"       role="Diseñador"        href="/admin/dashboard/disenador"              status="En línea"  />
            <RoleLink label="Taller de Corte"       role="Cortador"         href="/admin/dashboard/cortador"               status="Activo"    />
            <RoleLink label="Atención al Cliente"   role="Recepcionista"    href="/admin/dashboard/recepcionista"          status="En línea"  />
            <RoleLink label="Logística Interna"     role="Ayudante"         href="/admin/dashboard/ayudante"               status="Activo"    />
            <RoleLink label="Gestión de Taller"     role="Rep. Taller"      href="/admin/dashboard/representante_taller"   status="Pendiente" />
          </div>
        </div>

        {/* Gráfico de producción */}
        <div className="lg:col-span-2 rounded-[2.5rem] p-8 text-white" style={{ background: ROLE_TEXT }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold">Rendimiento de Producción</h3>
              <p className="text-sm mt-1" style={{ color: ROLE_BG }}>Comparativa semanal de salida de prendas</p>
            </div>
            <BarChart3 className="w-8 h-8" style={{ color: ROLE_MID }} />
          </div>
          <div className="h-64 flex items-end gap-4 justify-between">
            {[45, 60, 85, 70, 95, 50, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-xl relative overflow-hidden" style={{ height: '100%', background: `${ROLE_ACCENT}22` }}>
                  <div
                    className="absolute bottom-0 w-full transition-all duration-1000"
                    style={{ height: `${h}%`, background: `linear-gradient(to top, ${ROLE_ACCENT}, ${ROLE_MID})` }}
                  />
                </div>
                <span className="text-[10px] font-bold" style={{ color: ROLE_BG }}>D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl" style={{ background: ROLE_BG }}>
          <Icon size={20} style={{ color: ROLE_ACCENT }} />
        </div>
        <span className="text-xs font-black" style={{ color: ROLE_MID }}>{trend}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-tighter" style={{ color: ROLE_MID }}>{title}</p>
      <p className="text-2xl font-black tracking-tight" style={{ color: ROLE_TEXT }}>{value}</p>
    </div>
  );
}

function RoleLink({ label, role, href, status }: any) {
  return (
    <a href={href} className="flex items-center justify-between p-4 rounded-2xl border transition-all group bg-white hover:border-violet-200 hover:bg-violet-50/30"
      style={{ borderColor: ROLE_BORDER }}>
      <div>
        <p className="text-xs font-bold" style={{ color: ROLE_TEXT }}>{label}</p>
        <p className="text-[10px]" style={{ color: ROLE_MID }}>{role}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black uppercase transition-colors" style={{ color: ROLE_BORDER }}>
          {status}
        </span>
        <ChevronRight size={14} style={{ color: ROLE_MID }} />
      </div>
    </a>
  );
}
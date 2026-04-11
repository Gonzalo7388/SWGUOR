import React from 'react';
import { DollarSign, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getCotizaciones, type CotizacionRow } from './actions';
import { CotizacionesHeader } from '@/components/admin/cotizaciones/CotizacionesHeader';
import { CotizacionActions } from '@/components/admin/cotizaciones/CotizacionActions';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'yellow' | 'emerald' | 'blue' | 'red';
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  // Load cotizaciones
  const cotizaciones = await getCotizaciones(estado);

  const stats = {
    pendientes: cotizaciones.filter((c) => c.estado === 'pendiente').length,
    aceptadas: cotizaciones.filter((c) => c.estado === 'aceptada').length,
    expiradas: cotizaciones.filter((c) => c.estado === 'expirada').length,
    totalValor: cotizaciones
      .filter((c) => c.estado !== 'rechazada' && c.estado !== 'expirada')
      .reduce((sum, c) => sum + c.monto, 0),
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pendiente' },
      aceptada: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Aceptada' },
      rechazada: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rechazada' },
      expirada: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Expirada' },
      borrador: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Borrador' },
    };
    return badges[estado] ?? badges.borrador;
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <CotizacionesHeader />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Pendientes" value={stats.pendientes} icon={<Calendar />} color="yellow" />
        <KpiCard label="Aceptadas" value={stats.aceptadas} icon={<CheckCircle2 />} color="emerald" />
        <KpiCard label="Expiradas" value={stats.expiradas} icon={<AlertTriangle />} color="red" />
        <KpiCard label="Valor Total" value={`S/ ${stats.totalValor.toLocaleString()}`} icon={<DollarSign />} color="blue" />
      </div>

      {/* FILTROS Y TABLA */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black uppercase text-slate-800">Cotizaciones</h3>
          <select
            name="estado"
            defaultValue={estado ?? 'todos'}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase bg-white"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
            <option value="expirada">Expirada</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Cotización</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Cliente</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Descripción</th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Monto</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Estado</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Vencimiento</th>
                <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((cot) => {
                const badge = getEstadoBadge(cot.estado);
                const isExpirada = cot.estado === 'expirada';
                
                return (
                  <tr 
                    key={cot.id} 
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      isExpirada ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">{cot.cotizacion_id}</td>
                    <td className="py-4 px-4 text-slate-700">{cot.cliente}</td>
                    <td className="py-4 px-4 text-slate-700 text-sm">{cot.descripcion}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      S/ {cot.monto.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-sm">
                      {cot.fecha_vencimiento}
                      {isExpirada && (
                        <span className="ml-2 text-[10px] text-orange-600 font-bold uppercase">
                          (Vencida)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {['pendiente', 'borrador'].includes(cot.estado) ? (
                        <CotizacionActions
                          cotizacionId={cot.id}
                          estado={cot.estado}
                          validaHasta={cot.fecha_vencimiento}
                          
                        />
                      ) : (
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: KpiCardProps) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  );
}

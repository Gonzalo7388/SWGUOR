"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { ROLE_PALETTES, type RolPaleta } from './widgets/DashboardUtils';

interface DashboardChartsProps {
  minimal?: boolean;
  rol: RolPaleta; // Ahora es obligatorio para mantener la coherencia
}

export default function DashboardCharts({ minimal = false, rol }: DashboardChartsProps) {
  // Obtenemos la paleta según el rol
  const theme = ROLE_PALETTES[rol] || ROLE_PALETTES.administrador;
  
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ventasData, setVentasData] = useState<any[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/charts?days=30`);
      const data = await response.json();
      setVentasData(data.ventasData || []);
    } catch (error) {
      console.error("Error cargando gráficas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isMounted) fetchData(); }, [isMounted, fetchData]);

  if (!isMounted) return null;

  // --- DISEÑO ACOPLADO AL SISTEMA DE ROLES ---
  return (
    <div style={{ 
      background: '#ffffff', 
      border: `1px solid #e2e8f0`, 
      borderRadius: 12, 
      padding: '24px',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Flujo de Actividad
          </h3>
          <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            Rendimiento mensual de {rol}
          </p>
        </div>
        <div style={{ 
          padding: '6px 12px', 
          background: `${theme.accent}10`, 
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 800,
          color: theme.accent,
          border: `1px solid ${theme.accent}20`
        }}>
          ↑ +12.5% ESTE MES
        </div>
      </div>

      <div style={{ width: '100%', height: minimal ? 180 : 300 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black animate-pulse text-slate-400 uppercase">
            Sincronizando datos...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ventasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorGrad-${rol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="fecha" 
                tick={{fontSize: 9, fontWeight: 600, fill: '#94a3b8'}} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{fontSize: 9, fontWeight: 600, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `S/${v}`}
              />
              <Tooltip content={<CustomTooltip accent={theme.accent} />} />
              <Area 
                type="monotone" 
                dataKey="ventas" 
                stroke={theme.accent} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#colorGrad-${rol})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!minimal && (
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <MiniStat label="Ventas" value="S/ 12.4k" icon={<TrendingUp size={14}/>} color={theme.accent} />
          <MiniStat label="Pedidos" value="48" icon={<ShoppingCart size={14}/>} color={theme.accent} />
          <MiniStat label="Meta" value="92%" icon={<Package size={14}/>} color={theme.accent} />
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

function MiniStat({ label, value, icon, color }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-400">
        <div style={{ color: color }}>{icon}</div>
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, accent }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-sm font-black">S/ {payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};
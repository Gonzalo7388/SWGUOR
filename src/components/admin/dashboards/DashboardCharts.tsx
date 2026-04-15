"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';
// Importamos el tipo para que TypeScript no de error
import { COMPANY_PALETTE, type RolPaleta } from './widgets/DashboardUtils';

// ACTUALIZACIÓN: Se agrega 'rol' a la interfaz
interface DashboardChartsProps {
  minimal?: boolean;
  rol?: RolPaleta; 
}

export default function DashboardCharts({ minimal = false, rol }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ventasData, setVentasData] = useState<any[]>([]);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

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

  useEffect(() => { 
    if (isMounted) fetchData(); 
  }, [isMounted, fetchData]);

  if (!isMounted) return null;

  return (
    <div className="bg-white border border-[#F2D2BD]/40 rounded-[32px] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-sm font-black text-[#2B1B12] uppercase tracking-widest">Actividad</h3>
          <p className="text-[10px] text-[#C05A31] font-bold mt-1 uppercase tracking-tighter">
            {/* Opcionalmente puedes usar el rol aquí o dejarlo genérico */}
            Rendimiento {rol ? rol.replace('_', ' ') : 'Institucional'}
          </p>
        </div>
        <div 
          className="px-4 py-2 rounded-xl text-[10px] font-black border"
          style={{ 
            backgroundColor: COMPANY_PALETTE.bgSoft, 
            color: COMPANY_PALETTE.accent,
            borderColor: `${COMPANY_PALETTE.border}66`
          }}
        >
          ↑ +12.5%
        </div>
      </div>

      <div style={{ width: '100%', height: minimal ? 180 : 350 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black animate-pulse text-[#C05A31] uppercase">
            Cargando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ventasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCorp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COMPANY_PALETTE.accent} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={COMPANY_PALETTE.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COMPANY_PALETTE.bgSoft} />
              <XAxis 
                dataKey="fecha" 
                tick={{fontSize: 10, fontWeight: 700, fill: COMPANY_PALETTE.text}} 
                axisLine={false} tickLine={false} 
              />
              <YAxis 
                tick={{fontSize: 10, fontWeight: 700, fill: COMPANY_PALETTE.text}} 
                axisLine={false} tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" dataKey="ventas" 
                stroke={COMPANY_PALETTE.accent} strokeWidth={4} 
                fillOpacity={1} fill="url(#colorCorp)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!minimal && (
        <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t" style={{ borderColor: COMPANY_PALETTE.bgSoft }}>
          <MiniStat label="Ventas" value="S/ 12k" icon={<TrendingUp size={16}/>} />
          <MiniStat label="Pedidos" value="48" icon={<ShoppingCart size={16}/>} />
          <MiniStat label="Meta" value="92%" icon={<Package size={16}/>} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2" style={{ color: COMPANY_PALETTE.mid }}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xl font-black text-[#2B1B12]">{value}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div 
        className="text-white p-4 rounded-2xl shadow-2xl border"
        style={{ backgroundColor: COMPANY_PALETTE.text, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <p className="text-[9px] font-black uppercase mb-1" style={{ color: COMPANY_PALETTE.border }}>{label}</p>
        <p className="text-lg font-black">S/ {payload[0].value}</p>
      </div>
    );
  }
  return null;
}
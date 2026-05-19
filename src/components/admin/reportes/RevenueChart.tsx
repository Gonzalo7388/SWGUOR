'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface RevenueChartProps {
  data: any[];
  totalPeriodo: number;
  formatCurrency: (val: number) => string;
  isMounted: boolean;
  CustomTooltip: React.ComponentType<any>;
}

export default function RevenueChart({ 
  data, 
  totalPeriodo, 
  formatCurrency, 
  isMounted,
  CustomTooltip
}: RevenueChartProps) {
  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-2">
      <CardHeader className="p-8 pb-0">
        <div className="flex justify-between items-end">
          <div>
            <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Rendimiento Financiero</CardTitle>
            <p className="text-sm text-slate-400 font-medium mt-1">Comparativa de ventas diarias</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-900 leading-none">{formatCurrency(totalPeriodo)}</p>
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2">Acumulado Periodo</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 h-[400px]">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="fecha" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="ventas" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

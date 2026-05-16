'use client';

import { Card } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

const COLORS = ['#4f46e5', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6'];

interface CategoryProfitabilityProps {
  data: any[];
  CustomTooltip: React.ComponentType<any>;
}

export default function CategoryProfitability({ data, CustomTooltip }: CategoryProfitabilityProps) {
  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
      <div className="mb-8 px-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Rentabilidad por Categoría</h3>
        <p className="text-sm text-slate-400 font-medium">Volumen de ventas segmentado por línea</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}}
              tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
            />
            <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

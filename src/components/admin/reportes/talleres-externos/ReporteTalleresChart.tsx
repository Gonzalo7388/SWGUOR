'use client';

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

import type {
  ReporteTallerItem,
} from '@/types/reporte-talleres';

interface Props {
  data: ReporteTallerItem[];
}

export default function ReporteTalleresChart({
  data,
}: Props) {
  return (
    <div className="rounded-3xl border border-[#e4c28a]/20 bg-[#fbddd3] p-6 shadow-sm">

      <div className="mb-6">

        <h3 className="text-xl font-bold text-[#231e1d]">
          Progreso por Taller
        </h3>

        <p className="mt-1 text-sm text-[#231e1d]/60">
          Seguimiento de avance de producción
        </p>

      </div>

      <div className="h-[380px]">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e4c28a"
            />

            <XAxis
              type="number"
              tick={{ fill: '#231e1d' }}
            />

            <YAxis
              dataKey="taller"
              type="category"
              width={140}
              tick={{ fill: '#231e1d', fontSize: 12 }}
            />

            <Tooltip />

            <Bar
              dataKey="avance"
              radius={[0, 10, 10, 0]}
              fill="#b5854b"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}
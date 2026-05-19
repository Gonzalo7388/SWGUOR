'use client';

import { TrendingUp, ShoppingBag, Zap, Target } from 'lucide-react';
import StatCard from '@/components/admin/common/StatCard';

interface ReportStatsProps {
  metrics: {
    total: number;
    pedidos: number;
    produccionEnCurso: number;
  } | null;
  formatCurrency: (val: number) => string;
}

export default function ReportStats({ metrics, formatCurrency }: ReportStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Ventas Totales"
        value={formatCurrency(metrics?.total || 0)}
        icon={TrendingUp}
        color="pink"
        disabled
      />
      <StatCard
        title="Pedidos Activos"
        value={metrics?.pedidos || 0}
        icon={ShoppingBag}
        color="slate"
        disabled
      />
      <StatCard
        title="Capital en Proceso"
        value={formatCurrency(metrics?.produccionEnCurso || 0)}
        icon={Zap}
        color="emerald"
        disabled
      />
      <StatCard
        title="Eficiencia Global"
        value="94.2%"
        icon={Target}
        color="orange"
        disabled
      />
    </div>
  );
}

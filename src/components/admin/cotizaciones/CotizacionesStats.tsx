'use client';

import { Calendar, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import StatCard from '@/components/admin/common/StatCard';

interface CotizacionesStatsProps {
  stats: { pendientes: number; aprobadas: number; expiradas: number; totalValor: number };
  estadoFiltro: string | null;
  onFiltroChange: (filtro: string | null) => void;
}

export function CotizacionesStats({ stats, estadoFiltro, onFiltroChange }: CotizacionesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Pendientes"
        value={stats.pendientes}
        icon={Calendar}
        color="orange"
        isActive={estadoFiltro === 'enviada'}
        onClick={() => onFiltroChange(estadoFiltro === 'enviada' ? null : 'enviada')}
      />
      <StatCard
        title="Aprobadas"
        value={stats.aprobadas}
        icon={CheckCircle2}
        color="emerald"
        isActive={estadoFiltro === 'aprobada'}
        onClick={() => onFiltroChange(estadoFiltro === 'aprobada' ? null : 'aprobada')}
      />
      <StatCard
        title="Expiradas"
        value={stats.expiradas}
        icon={AlertTriangle}
        color="orange"
        isActive={estadoFiltro === 'expirada'}
        onClick={() => onFiltroChange(estadoFiltro === 'expirada' ? null : 'expirada')}
      />
      <StatCard
        title="Valor Activo"
        value={`S/ ${(stats.totalValor / 1000000).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`}
        icon={DollarSign}
        color="blue"
        disabled
      />
    </div>
  );
}
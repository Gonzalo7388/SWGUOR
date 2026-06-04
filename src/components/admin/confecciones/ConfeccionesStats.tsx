'use client';

import { Scissors, Clock, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import StatCard from '@/components/admin/common/StatCard';

interface ConfeccionesStatsProps {
  stats: {
    total: number;
    prioridadBaja: number;
    prioridadMedia: number;
    prioridadAlta: number;
    prioridadUrgente: number;
  };
  statusFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export default function ConfeccionesStats({ stats, statusFilter, onFilterChange }: ConfeccionesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        title="Total Órdenes"
        value={stats.total}
        icon={Scissors}
        color="pink"
        isActive={statusFilter === null}
        onClick={() => onFilterChange(null)}
      />
      <StatCard
        title="Prioridad Baja"
        value={stats.prioridadBaja}
        icon={Clock}
        color="slate"
        isActive={statusFilter === 'baja'}
        onClick={() => onFilterChange('baja')}
      />
      <StatCard
        title="Prioridad Media"
        value={stats.prioridadMedia}
        icon={TrendingUp}
        color="blue"
        isActive={statusFilter === 'media'}
        onClick={() => onFilterChange('media')}
      />
      <StatCard
        title="Prioridad Alta"
        value={stats.prioridadAlta}
        icon={AlertTriangle}
        color="orange"
        isActive={statusFilter === 'alta'}
        onClick={() => onFilterChange('alta')}
      />
      <StatCard
        title="Prioridad Urgente"
        value={stats.prioridadUrgente}
        icon={Flame}
        color="red"
        isActive={statusFilter === 'urgente'}
        onClick={() => onFilterChange('urgente')}
      />
    </div>
  );
}
'use client';

import React from 'react';
import { ArrowUp, ArrowDown, RotateCcw, TrendingUp } from 'lucide-react';
import StatCard from '@/components/admin/common/StatCard';

export interface EstadisticasMovimientosType {
  totalEntradas: number;
  totalSalidas: number;
  totalAjustes: number;
  totalMovimientos: number;
  montoTotalEntradas?: number;
  montoTotalSalidas?: number;
}

interface EstadisticasMovimientosProps {
  estadisticas: EstadisticasMovimientosType;
  isLoading?: boolean;
}

export function EstadisticasMovimientos({
  estadisticas,
  isLoading,
}: EstadisticasMovimientosProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Entradas"
        value={estadisticas.totalEntradas}
        icon={ArrowUp}
        color="emerald"
        disabled
      />
      <StatCard
        title="Salidas"
        value={estadisticas.totalSalidas}
        icon={ArrowDown}
        color="orange"
        disabled
      />
      <StatCard
        title="Ajustes"
        value={estadisticas.totalAjustes}
        icon={RotateCcw}
        color="blue"
        disabled
      />
      <StatCard
        title="Total Global"
        value={estadisticas.totalMovimientos}
        icon={TrendingUp}
        color="slate"
        disabled
      />
    </div>
  );
}

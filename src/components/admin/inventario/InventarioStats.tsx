"use client";

import StatCard from "../common/StatCard";
import { Layers, CheckCircle2, AlertTriangle, CircleDollarSign } from "lucide-react";

interface InventarioStatsProps {
  stats: {
    total: number;
    optimo: number;
    bajoStock: number;
    valorAlmacen: number;
  };
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
}

export default function InventarioStats({
  stats,
  statusFilter,
  setStatusFilter,
}: InventarioStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="TOTAL"
        value={stats.total}
        icon={Layers}
        isActive={statusFilter === null}
        color="pink"
        onClick={() => setStatusFilter(null)}
      />
      <StatCard
        title="STOCK ÓPTIMO"
        value={stats.optimo}
        icon={CheckCircle2}
        isActive={statusFilter === "optimo"}
        color="emerald"
        onClick={() => setStatusFilter(statusFilter === "optimo" ? null : "optimo")}
      />
      <StatCard
        title="STOCK BAJO"
        value={stats.bajoStock}
        icon={AlertTriangle}
        isActive={statusFilter === "bajoStock"}
        color="orange"
        onClick={() => setStatusFilter(statusFilter === "bajoStock" ? null : "bajoStock")}
      />
      <StatCard
        title="VALOR ALMACÉN"
        value={`S/ ${stats.valorAlmacen.toLocaleString("es-PE", {
          maximumFractionDigits: 0,
        })}`}
        icon={CircleDollarSign}
        isActive={false}
        color="blue"
        disabled
      />
    </div>
  );
}

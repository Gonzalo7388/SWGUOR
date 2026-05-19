"use client";

import StatCard from "../common/StatCard";
import { Package, CheckCircle2, AlertTriangle } from "lucide-react";

interface ProductosStatsProps {
  stats: {
    total: number;
    activos: number;
    bajoStock: number;
  };
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  onPageReset: () => void;
}

export default function ProductosStats({
  stats,
  statusFilter,
  setStatusFilter,
  onPageReset,
}: ProductosStatsProps) {
  const handleFilter = (filter: string | null) => {
    setStatusFilter(filter);
    onPageReset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="TOTAL PRODUCTOS"
        value={stats.total}
        icon={Package}
        isActive={statusFilter === null}
        color="pink"
        onClick={() => handleFilter(null)}
      />
      <StatCard
        title="EN LÍNEA / ACTIVOS"
        value={stats.activos}
        icon={CheckCircle2}
        isActive={statusFilter === "activo"}
        color="emerald"
        onClick={() => handleFilter("activo")}
      />
      <StatCard
        title="REPOSICIÓN (STOCK BAJO)"
        value={stats.bajoStock}
        icon={AlertTriangle}
        isActive={statusFilter === "bajoStock"}
        color="orange"
        onClick={() => handleFilter("bajoStock")}
      />
    </div>
  );
}

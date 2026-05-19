"use client";

import StatCard from "../common/StatCard";
import { ShoppingBag, Clock, CheckCircle2, XCircle } from "lucide-react";

interface PedidosStatsProps {
  stats: {
    total: number;
    pendientes: number;
    completados: number;
    cancelados: number;
  };
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onPageReset: () => void;
}

export default function PedidosStats({
  stats,
  statusFilter,
  setStatusFilter,
  onPageReset,
}: PedidosStatsProps) {
  const handleFilter = (filter: string) => {
    setStatusFilter(filter);
    onPageReset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="TOTAL PEDIDOS"
        value={stats.total}
        icon={ShoppingBag}
        isActive={statusFilter === "todos"}
        color="pink"
        onClick={() => handleFilter("todos")}
      />
      <StatCard
        title="PENDIENTES"
        value={stats.pendientes}
        icon={Clock}
        isActive={statusFilter === "solicitud"}
        color="orange"
        onClick={() => handleFilter("solicitud")}
      />
      <StatCard
        title="COMPLETADOS"
        value={stats.completados}
        icon={CheckCircle2}
        isActive={statusFilter === "finalizado"}
        color="emerald"
        onClick={() => handleFilter("finalizado")}
      />
      <StatCard
        title="CANCELADOS"
        value={stats.cancelados}
        icon={XCircle}
        isActive={statusFilter === "cancelado"}
        color="slate"
        onClick={() => handleFilter("cancelado")}
      />
    </div>
  );
}

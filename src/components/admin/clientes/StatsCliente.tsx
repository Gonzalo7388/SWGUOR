"use client";

import StatCard from "../common/StatCard";
import { Building2, ShieldCheck, ShieldOff, ShoppingBag } from "lucide-react";
import type { ClienteListItem } from "@/lib/services/clientes.service";

interface Props {
  clientes: ClienteListItem[];
  loading?: boolean;
  statusFilter?: "activo" | "inactivo" | "conPedidos" | null;
  onFilterChange?: (f: "activo" | "inactivo" | "conPedidos" | null) => void;
}

function tienePedidoReciente(c: ClienteListItem): boolean {
  if (!c.ultimo_pedido_en) return false;
  return Date.now() - new Date(c.ultimo_pedido_en).getTime() < 90 * 24 * 60 * 60 * 1000;
}

export default function StatsClientes({ clientes, loading, statusFilter = null, onFilterChange }: Props) {
  const total = clientes.length;
  const activos = clientes.filter((c) => c.activo === "activo").length;
  const inactivos = clientes.filter((c) => c.activo !== "activo").length;
  const conPedidos = clientes.filter(tienePedidoReciente).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="TOTAL CLIENTES"
        value={total}
        icon={Building2}
        isActive={statusFilter === null}
        color="slate"
        onClick={() => onFilterChange?.(null)}
      />
      <StatCard
        title="ACTIVOS"
        value={activos}
        icon={ShieldCheck}
        isActive={statusFilter === "activo"}
        color="emerald"
        onClick={() => onFilterChange?.("activo")}
      />
      <StatCard
        title="SUSPENDIDOS"
        value={inactivos}
        icon={ShieldOff}
        isActive={statusFilter === "inactivo"}
        color="orange"
        onClick={() => onFilterChange?.("inactivo")}
      />
      <StatCard
        title="PEDIDOS RECIENTES"
        value={conPedidos}
        icon={ShoppingBag}
        isActive={statusFilter === "conPedidos"}
        color="pink"
        onClick={() => onFilterChange?.("conPedidos")}
      />
    </div>
  );
}
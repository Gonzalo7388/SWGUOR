"use client";

import { Building2, ShieldCheck, ShieldOff, ShoppingBag } from "lucide-react";
import type { ClienteListItem } from "@/lib/services/clientes-services";

interface Props {
  clientes:       ClienteListItem[];
  loading?:       boolean;
  statusFilter?:  "activo" | "inactivo" | "conPedidos" | null;
  onFilterChange?: (f: "activo" | "inactivo" | "conPedidos" | null) => void;
}

function tienePedidoReciente(c: ClienteListItem): boolean {
  if (!c.ultimo_pedido_en) return false;
  return Date.now() - new Date(c.ultimo_pedido_en).getTime() < 90 * 24 * 60 * 60 * 1000;
}

export default function StatsClientes({ clientes, loading, statusFilter = null, onFilterChange }: Props) {
  const total      = clientes.length;
  const activos    = clientes.filter((c) => c.activo === "activo").length;
  const inactivos  = clientes.filter((c) => c.activo !== "activo").length;
  const conPedidos = clientes.filter(tienePedidoReciente).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="TOTAL CLIENTES"
        value={total}
        icon={<Building2 className="w-6 h-6" />}
        isActive={statusFilter === null}
        color="blue"
        onClick={() => onFilterChange?.(null)}
      />
      <StatCard
        title="ACTIVOS"
        value={activos}
        icon={<ShieldCheck className="w-6 h-6" />}
        isActive={statusFilter === "activo"}
        color="emerald"
        onClick={() => onFilterChange?.("activo")}
      />
      <StatCard
        title="SUSPENDIDOS"
        value={inactivos}
        icon={<ShieldOff className="w-6 h-6" />}
        isActive={statusFilter === "inactivo"}
        color="orange"
        onClick={() => onFilterChange?.("inactivo")}
      />
      <StatCard
        title="PEDIDOS RECIENTES"
        value={conPedidos}
        icon={<ShoppingBag className="w-6 h-6" />}
        isActive={statusFilter === "conPedidos"}
        color="pink"
        onClick={() => onFilterChange?.("conPedidos")}
      />
    </div>
  );
}

// ─── StatCard — mismo diseño que Inventario ───────────────────
export function StatCard({ title, value, icon, isActive, color, onClick }: {
  title: string; value: number; icon: React.ReactNode;
  isActive: boolean; color: string; onClick: () => void;
}) {
  const styles: Record<string, { active: string; iconActive: string; textActive: string }> = {
    pink:    { active: "border-pink-500    ring-pink-50    bg-white", iconActive: "bg-pink-600    text-white", textActive: "text-pink-600"    },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", iconActive: "bg-emerald-600 text-white", textActive: "text-emerald-600" },
    orange:  { active: "border-orange-500  ring-orange-50  bg-white", iconActive: "bg-orange-600  text-white", textActive: "text-orange-600"  },
    blue:    { active: "border-blue-500    ring-blue-50    bg-white", iconActive: "bg-blue-600    text-white", textActive: "text-blue-600"    },
    teal:    { active: "border-teal-500    ring-teal-50    bg-white", iconActive: "bg-teal-600    text-white", textActive: "text-teal-600"    },
  };
  const s = styles[color] ?? styles.pink;

  return (
    <button onClick={onClick}
      className={`group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
        isActive
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${s.active}`
          : "bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95"
      }`}>
      <div className={`p-3 rounded-lg transition-all duration-300 ${
        isActive ? `${s.iconActive} rotate-3` : "bg-gray-100 text-gray-600 group-hover:rotate-3"
      }`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${isActive ? s.textActive : "text-gray-800"}`}>{value}</p>
      </div>
    </button>
  );
}
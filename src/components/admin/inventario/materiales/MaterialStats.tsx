"use client";

import { useMemo } from "react";
import { Layers, AlertTriangle, XCircle, CircleDollarSign } from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────
interface Material {
  stock_actual:   number;
  stock_minimo:   number;
  precio_unitario?: number | string;
}

interface MaterialStatsProps {
  data:           Material[];
  statusFilter:   string | null;
  onFilterChange: (filter: string | null) => void;
}

// ─────────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────────
export default function MaterialStats({
  data,
  statusFilter,
  onFilterChange,
}: MaterialStatsProps) {
  const stats = useMemo(() => {
    const total      = data.length;
    const bajoStock  = data.filter(m => m.stock_actual > 0 && m.stock_actual <= m.stock_minimo).length;
    const sinStock   = data.filter(m => m.stock_actual <= 0).length;
    const optimo     = total - bajoStock - sinStock;
    const valorTotal = data.reduce(
      (acc, m) => acc + (Number(m.precio_unitario ?? 0) * Number(m.stock_actual ?? 0)),
      0
    );
    return { total, bajoStock, sinStock, optimo, valorTotal };
  }, [data]);

  const valorFormateado = stats.valorTotal.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* ── Total ── */}
      <StatCard
        label="Total ítems"
        value={stats.total}
        sub={`${stats.optimo} en estado óptimo`}
        icon={<Layers className="w-5 h-5" />}
        isActive={statusFilter === null}
        onClick={() => onFilterChange(null)}
        variant="neutral"
      />

      {/* ── Bajo stock ── */}
      <StatCard
        label="Stock bajo"
        value={stats.bajoStock}
        sub="Próximos a agotarse"
        icon={<AlertTriangle className="w-5 h-5" />}
        isActive={statusFilter === "bajoStock"}
        onClick={() => onFilterChange(statusFilter === "bajoStock" ? null : "bajoStock")}
        variant="warning"
      />

      {/* ── Sin stock ── */}
      <StatCard
        label="Sin stock"
        value={stats.sinStock}
        sub="Requieren reposición"
        icon={<XCircle className="w-5 h-5" />}
        isActive={statusFilter === "sinStock"}
        onClick={() => onFilterChange(statusFilter === "sinStock" ? null : "sinStock")}
        variant="danger"
      />

      {/* ── Valor estimado ── no filtra ── */}
      <StatCard
        label="Valor estimado"
        value={`S/ ${valorFormateado}`}
        sub="Basado en precio unitario"
        icon={<CircleDollarSign className="w-5 h-5" />}
        isActive={false}
        onClick={() => {}}
        variant="success"
        noFilter
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  StatCard rediseñado
// ─────────────────────────────────────────────────────────────
type Variant = "neutral" | "warning" | "danger" | "success";

const VARIANT_CONFIG: Record<Variant, {
  idle:       string;   // clases cuando NO está activo
  active:     string;   // clases cuando SÍ está activo
  iconIdle:   string;
  iconActive: string;
  valueColor: string;
  bar:        string;   // color de la barra decorativa
}> = {
  neutral: {
    idle:       "border-gray-100 hover:border-pink-200 hover:shadow-pink-100",
    active:     "border-pink-400 shadow-pink-100 ring-2 ring-pink-100",
    iconIdle:   "bg-pink-50   text-pink-500",
    iconActive: "bg-pink-600  text-white",
    valueColor: "text-pink-700",
    bar:        "bg-gradient-to-r from-pink-400 to-rose-400",
  },
  warning: {
    idle:       "border-gray-100 hover:border-orange-200 hover:shadow-orange-100",
    active:     "border-orange-400 shadow-orange-100 ring-2 ring-orange-100",
    iconIdle:   "bg-orange-50  text-orange-500",
    iconActive: "bg-orange-500 text-white",
    valueColor: "text-orange-600",
    bar:        "bg-gradient-to-r from-orange-400 to-amber-400",
  },
  danger: {
    idle:       "border-gray-100 hover:border-red-200 hover:shadow-red-100",
    active:     "border-red-400 shadow-red-100 ring-2 ring-red-100",
    iconIdle:   "bg-red-50    text-red-500",
    iconActive: "bg-red-600   text-white",
    valueColor: "text-red-600",
    bar:        "bg-gradient-to-r from-red-400 to-rose-500",
  },
  success: {
    idle:       "border-gray-100 hover:border-emerald-200 hover:shadow-emerald-50",
    active:     "border-emerald-400 shadow-emerald-50 ring-2 ring-emerald-100",
    iconIdle:   "bg-emerald-50 text-emerald-500",
    iconActive: "bg-emerald-600 text-white",
    valueColor: "text-emerald-700",
    bar:        "bg-gradient-to-r from-emerald-400 to-teal-400",
  },
};

function StatCard({
  label,
  value,
  sub,
  icon,
  isActive,
  onClick,
  variant,
  noFilter = false,
}: {
  label:    string;
  value:    number | string;
  sub:      string;
  icon:     React.ReactNode;
  isActive: boolean;
  onClick:  () => void;
  variant:  Variant;
  noFilter?: boolean;
}) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <button
      onClick={onClick}
      disabled={noFilter}
      className={[
        // base
        "group relative overflow-hidden w-full text-left",
        "bg-white rounded-2xl border shadow-sm",
        "p-4 transition-all duration-200",
        // cursor
        noFilter ? "cursor-default" : "cursor-pointer",
        // estado activo / inactivo
        isActive
          ? `${cfg.active} shadow-md -translate-y-0.5`
          : `${cfg.idle} hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`,
      ].join(" ")}
    >
      {/* Barra superior de color */}
      <span
        className={[
          "absolute inset-x-0 top-0 h-[3px] rounded-t-2xl transition-all duration-300",
          cfg.bar,
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        ].join(" ")}
      />

      {/* Contenido */}
      <div className="flex items-start justify-between gap-3">

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate mb-1">
            {label}
          </p>
          <p className={[
            "text-2xl font-black leading-none tracking-tight",
            isActive ? cfg.valueColor : "text-gray-800",
          ].join(" ")}>
            {value}
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">{sub}</p>
        </div>

        {/* Ícono */}
        <div className={[
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          "transition-all duration-200",
          isActive ? cfg.iconActive : cfg.iconIdle,
          !noFilter && "group-hover:scale-110",
        ].join(" ")}>
          {icon}
        </div>
      </div>

      {/* Indicador de filtro activo */}
      {isActive && !noFilter && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={[
            "inline-block w-1.5 h-1.5 rounded-full animate-pulse",
            cfg.bar,
          ].join(" ")} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Filtro activo
          </span>
        </div>
      )}
    </button>
  );
}
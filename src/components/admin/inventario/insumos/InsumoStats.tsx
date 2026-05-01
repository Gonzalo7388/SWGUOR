'use client'

import { useMemo } from 'react'
import type { Database } from '@/types/database'
import { Package, AlertTriangle, XCircle, BarChart3 } from 'lucide-react'

type Insumo = Database['public']['Tables']['insumo']['Row']

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────
interface InventoryStatsProps {
  data:           Insumo[]
  statusFilter:   string | null
  onFilterChange: (filter: string | null) => void
}

// ─────────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────────
export default function InventoryStats({
  data,
  statusFilter,
  onFilterChange,
}: InventoryStatsProps) {
  const stats = useMemo(() => {
    const total          = data.length
    const stockCritico   = data.filter(i => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length
    const sinStock       = data.filter(i => i.stock_actual <= 0).length
    const tiposDiferentes = new Set(data.map(i => i.tipo)).size
    return { total, stockCritico, sinStock, tiposDiferentes }
  }, [data])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* ── Total ── */}
      <StatCard
        label="Total Insumos"
        value={stats.total}
        sub={`${stats.tiposDiferentes} categorías distintas`}
        icon={<Package className="w-5 h-5" />}
        isActive={statusFilter === null}
        onClick={() => onFilterChange(null)}
        variant="neutral"
      />

      {/* ── Stock crítico ── */}
      <StatCard
        label="Stock crítico"
        value={stats.stockCritico}
        sub="Por debajo del mínimo"
        icon={<AlertTriangle className="w-5 h-5" />}
        isActive={statusFilter === 'stockCritico'}
        onClick={() => onFilterChange(statusFilter === 'stockCritico' ? null : 'stockCritico')}
        variant="warning"
      />

      {/* ── Sin stock ── */}
      <StatCard
        label="Sin stock"
        value={stats.sinStock}
        sub="Requieren reposición"
        icon={<XCircle className="w-5 h-5" />}
        isActive={statusFilter === 'sinStock'}
        onClick={() => onFilterChange(statusFilter === 'sinStock' ? null : 'sinStock')}
        variant="danger"
      />

      {/* ── Categorías ── no filtra ── */}
      <StatCard
        label="Categorías"
        value={stats.tiposDiferentes}
        sub="Tipos de insumos registrados"
        icon={<BarChart3 className="w-5 h-5" />}
        isActive={false}
        onClick={() => {}}
        variant="info"
        noFilter
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  StatCard
// ─────────────────────────────────────────────────────────────
type Variant = 'neutral' | 'warning' | 'danger' | 'info'

const VARIANT_CONFIG: Record<Variant, {
  idle:       string
  active:     string
  iconIdle:   string
  iconActive: string
  valueColor: string
  bar:        string
}> = {
  neutral: {
    idle:       'border-gray-100 hover:border-blue-200 hover:shadow-blue-100',
    active:     'border-blue-400 shadow-blue-100 ring-2 ring-blue-100',
    iconIdle:   'bg-blue-50   text-blue-500',
    iconActive: 'bg-blue-600  text-white',
    valueColor: 'text-blue-700',
    bar:        'bg-gradient-to-r from-blue-400 to-indigo-400',
  },
  warning: {
    idle:       'border-gray-100 hover:border-orange-200 hover:shadow-orange-100',
    active:     'border-orange-400 shadow-orange-100 ring-2 ring-orange-100',
    iconIdle:   'bg-orange-50  text-orange-500',
    iconActive: 'bg-orange-500 text-white',
    valueColor: 'text-orange-600',
    bar:        'bg-gradient-to-r from-orange-400 to-amber-400',
  },
  danger: {
    idle:       'border-gray-100 hover:border-red-200 hover:shadow-red-100',
    active:     'border-red-400 shadow-red-100 ring-2 ring-red-100',
    iconIdle:   'bg-red-50    text-red-500',
    iconActive: 'bg-red-600   text-white',
    valueColor: 'text-red-600',
    bar:        'bg-gradient-to-r from-red-400 to-rose-500',
  },
  info: {
    idle:       'border-gray-100 hover:border-purple-200 hover:shadow-purple-50',
    active:     'border-purple-400 shadow-purple-50 ring-2 ring-purple-100',
    iconIdle:   'bg-purple-50 text-purple-500',
    iconActive: 'bg-purple-600 text-white',
    valueColor: 'text-purple-700',
    bar:        'bg-gradient-to-r from-purple-400 to-violet-400',
  },
}

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
  label:     string
  value:     number | string
  sub:       string
  icon:      React.ReactNode
  isActive:  boolean
  onClick:   () => void
  variant:   Variant
  noFilter?: boolean
}) {
  const cfg = VARIANT_CONFIG[variant]

  return (
    <button
      onClick={onClick}
      disabled={noFilter}
      className={[
        'group relative overflow-hidden w-full text-left',
        'bg-white rounded-2xl border shadow-sm',
        'p-4 transition-all duration-200',
        noFilter ? 'cursor-default' : 'cursor-pointer',
        isActive
          ? `${cfg.active} shadow-md -translate-y-0.5`
          : `${cfg.idle} hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`,
      ].join(' ')}
    >
      {/* Barra superior de color */}
      <span
        className={[
          'absolute inset-x-0 top-0 h-[3px] rounded-t-2xl transition-all duration-300',
          cfg.bar,
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
        ].join(' ')}
      />

      {/* Contenido */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate mb-1">
            {label}
          </p>
          <p className={[
            'text-2xl font-black leading-none tracking-tight',
            isActive ? cfg.valueColor : 'text-gray-800',
          ].join(' ')}>
            {value}
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">{sub}</p>
        </div>

        <div className={[
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          'transition-all duration-200',
          isActive ? cfg.iconActive : cfg.iconIdle,
          !noFilter && 'group-hover:scale-110',
        ].join(' ')}>
          {icon}
        </div>
      </div>

      {/* Indicador de filtro activo */}
      {isActive && !noFilter && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={[
            'inline-block w-1.5 h-1.5 rounded-full animate-pulse',
            cfg.bar,
          ].join(' ')} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Filtro activo
          </span>
        </div>
      )}
    </button>
  )
}
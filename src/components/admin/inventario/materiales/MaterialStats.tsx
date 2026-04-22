'use client'

import { useMemo } from 'react'
import { Layers, AlertTriangle, XCircle, CircleDollarSign } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────
interface Material {
  stock_actual:    number
  stock_minimo:    number
  precio_unitario?: number | string
}

interface MaterialStatsProps {
  data:           Material[]
  statusFilter:   string | null
  onFilterChange: (filter: string | null) => void
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
    const total      = data.length
    const bajoStock  = data.filter(m => m.stock_actual > 0 && m.stock_actual <= m.stock_minimo).length
    const sinStock   = data.filter(m => m.stock_actual <= 0).length
    const optimo     = total - bajoStock - sinStock
    const valorTotal = data.reduce(
      (acc, m) => acc + (Number(m.precio_unitario ?? 0) * Number(m.stock_actual ?? 0)),
      0
    )
    return { total, bajoStock, sinStock, optimo, valorTotal }
  }, [data])

  const valorFormateado = stats.valorTotal.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* ── Total ── */}
      <StatCard
        title="TOTAL MATERIALES"
        value={stats.total}
        sub={`${stats.optimo} en estado óptimo`}
        icon={<Layers className="w-6 h-6" />}
        isActive={statusFilter === null}
        color="pink"
        onClick={() => onFilterChange(null)}
      />

      {/* ── Bajo stock ── */}
      <StatCard
        title="STOCK BAJO"
        value={stats.bajoStock}
        sub="Próximos a agotarse"
        icon={<AlertTriangle className="w-6 h-6" />}
        isActive={statusFilter === 'bajoStock'}
        color="orange"
        onClick={() => onFilterChange(statusFilter === 'bajoStock' ? null : 'bajoStock')}
      />

      {/* ── Sin stock ── */}
      <StatCard
        title="SIN STOCK"
        value={stats.sinStock}
        sub="Requieren reposición"
        icon={<XCircle className="w-6 h-6" />}
        isActive={statusFilter === 'sinStock'}
        color="red"
        onClick={() => onFilterChange(statusFilter === 'sinStock' ? null : 'sinStock')}
      />

      {/* ── Valor estimado ── no filtra ── */}
      <StatCard
        title="VALOR ESTIMADO"
        value={`S/ ${valorFormateado}`}
        sub="Basado en precio unitario"
        icon={<CircleDollarSign className="w-6 h-6" />}
        isActive={false}
        color="emerald"
        onClick={() => {}}
        noFilter
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  StatCard — mismo diseño que Categorías
// ─────────────────────────────────────────────────────────────
type Color = 'pink' | 'orange' | 'red' | 'emerald'

const COLOR_STYLES: Record<Color, {
  active:     string
  iconActive: string
  textActive: string
}> = {
  pink: {
    active:     'border-pink-500 ring-pink-50 bg-white',
    iconActive: 'bg-pink-600 text-white',
    textActive: 'text-pink-600',
  },
  orange: {
    active:     'border-orange-500 ring-orange-50 bg-white',
    iconActive: 'bg-orange-600 text-white',
    textActive: 'text-orange-600',
  },
  red: {
    active:     'border-red-500 ring-red-50 bg-white',
    iconActive: 'bg-red-600 text-white',
    textActive: 'text-red-600',
  },
  emerald: {
    active:     'border-emerald-500 ring-emerald-50 bg-white',
    iconActive: 'bg-emerald-600 text-white',
    textActive: 'text-emerald-600',
  },
}

function StatCard({
  title,
  value,
  sub,
  icon,
  isActive,
  color,
  onClick,
  noFilter = false,
}: {
  title:     string
  value:     number | string
  sub:       string
  icon:      React.ReactNode
  isActive:  boolean
  color:     Color
  onClick:   () => void
  noFilter?: boolean
}) {
  const s = COLOR_STYLES[color]

  return (
    <button
      onClick={onClick}
      disabled={noFilter}
      className={[
        'group p-4 rounded-xl border transition-all duration-300',
        'flex items-center gap-4',
        noFilter ? 'cursor-default' : 'cursor-pointer',
        isActive
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${s.active}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95',
      ].join(' ')}
    >
      {/* Ícono */}
      <div className={[
        'p-3 rounded-lg transition-all duration-300',
        isActive
          ? `${s.iconActive} rotate-3`
          : 'bg-gray-100 text-gray-600 group-hover:rotate-3',
      ].join(' ')}>
        {icon}
      </div>

      {/* Texto */}
      <div className="text-left min-w-0">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">
          {title}
        </p>
        <p className={[
          'text-2xl font-black tracking-tight',
          isActive ? s.textActive : 'text-gray-800',
        ].join(' ')}>
          {value}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>
      </div>
    </button>
  )
}
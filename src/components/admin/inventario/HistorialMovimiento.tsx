'use client'

import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  User, 
  Calendar, 
  Tag,
  PackageSearch
} from 'lucide-react'

interface Movimiento {
  id: number
  fecha: string
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number
  motivo: string
  usuario: string
  insumo_nombre: string
}

export default function HistorialMovimiento({ movimientos }: { movimientos: Movimiento[] }) {
  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No hay movimientos registrados</p>
        <p className="text-xs text-gray-400">Las entradas y salidas aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {movimientos.map((m) => (
        <div 
          key={m.id} 
          className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          {/* Indicador lateral de color según tipo */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            m.tipo === 'ENTRADA' ? 'bg-emerald-500' : 
            m.tipo === 'SALIDA' ? 'bg-rose-500' : 'bg-amber-500'
          }`} />

          <div className="flex flex-col gap-3">
            {/* Fila Superior: Badge y Fecha */}
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                m.tipo === 'ENTRADA' ? 'bg-emerald-50 text-emerald-600' : 
                m.tipo === 'SALIDA' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {m.tipo === 'ENTRADA' && <ArrowUpRight className="w-3 h-3" />}
                {m.tipo === 'SALIDA' && <ArrowDownLeft className="w-3 h-3" />}
                {m.tipo === 'AJUSTE' && <RefreshCcw className="w-3 h-3" />}
                {m.tipo}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <Calendar className="w-3 h-3" />
                {new Date(m.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Contenido Principal */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-pink-600 transition-colors">
                {m.insumo_nombre}
              </h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {m.motivo}
              </p>
            </div>

            {/* Fila Inferior: Cantidad y Usuario */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-[11px] font-semibold">{m.usuario}</span>
              </div>
              
              <div className={`text-sm font-black ${
                m.tipo === 'ENTRADA' ? 'text-emerald-600' : 
                m.tipo === 'SALIDA' ? 'text-rose-600' : 'text-amber-600'
              }`}>
                {m.tipo === 'ENTRADA' ? '+' : m.tipo === 'SALIDA' ? '-' : ''}
                {m.cantidad} <span className="text-[10px] font-bold text-gray-400 ml-0.5">unid.</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
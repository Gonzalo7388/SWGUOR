'use client';

import { useMemo } from 'react';
import {
  ArrowUp, ArrowDown, RotateCcw, Calendar, User, Layers, Package,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { movimientos_inventario } from '@prisma/client';

interface MovimientosInventarioTableProps {
  data: any[];
  loading?: boolean;
  limit?: number;
}

const TIPO_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  entrada: {
    icon: <ArrowUp className="w-4 h-4" />,
    color: 'text-emerald-600 bg-emerald-50',
  },
  salida: {
    icon: <ArrowDown className="w-4 h-4" />,
    color: 'text-red-600 bg-red-50',
  },
  ajuste: {
    icon: <RotateCcw className="w-4 h-4" />,
    color: 'text-amber-600 bg-amber-50',
  },
};

export default function MovimientosInventarioTable({
  data,
  loading = false,
  limit = 20,
}: MovimientosInventarioTableProps) {
  
  const movimientos = useMemo(() => {
    return data.slice(0, limit);
  }, [data, limit]);

  const getTypeInfo = (tipo: string) => {
    return TIPO_ICONS[tipo] || TIPO_ICONS.ajuste;
  };

  const formatFecha = (fecha: Date | string) => {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Cargando historial…
        </p>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Sin movimientos registrados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            tipo: 'entrada',
            label: 'Entradas',
            count: data.filter(m => m.tipo_movimiento === 'entrada').length,
            icon: <ArrowUp className="w-4 h-4" />,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            tipo: 'salida',
            label: 'Salidas',
            count: data.filter(m => m.tipo_movimiento === 'salida').length,
            icon: <ArrowDown className="w-4 h-4" />,
            color: 'text-red-600 bg-red-50',
          },
          {
            tipo: 'ajuste',
            label: 'Ajustes',
            count: data.filter(m => m.tipo_movimiento === 'ajuste').length,
            icon: <RotateCcw className="w-4 h-4" />,
            color: 'text-amber-600 bg-amber-50',
          },
        ].map(stat => (
          <div
            key={stat.tipo}
            className={`rounded-2xl border p-4 flex items-center justify-between ${stat.color.replace('text-', 'border-').replace('bg-', 'bg-')}`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-black ${stat.color.split(' ')[0]}`}>
                {stat.count}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Material / Insumo
                </th>
                <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.map((mov, idx) => {
                const typeInfo = getTypeInfo(mov.tipo_movimiento);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold">
                          {formatFecha(mov.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg ${typeInfo.color}`}>
                        {typeInfo.icon}
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {mov.tipo_movimiento}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {mov.insumo?.nombre || mov.material?.nombre || 'Sin identificar'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {mov.insumo?.unidad_medida || mov.material?.unidad_medida || 'unidad'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div>
                        <p className="font-bold text-slate-800">
                          {Math.abs(Number(mov.cantidad || 0))}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {mov.tipo_movimiento === 'entrada' ? '+' : mov.tipo_movimiento === 'salida' ? '−' : '±'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-slate-600 font-medium line-clamp-2">
                        {mov.motivo || '−'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold">
                          {mov.usuarios?.email?.split('@')[0] || 'Sistema'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mostrar más */}
      {data.length > limit && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-400 font-semibold mb-3">
            Mostrando {limit} de {data.length} movimientos
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Ver todos los movimientos ({data.length})
          </Button>
        </div>
      )}
    </div>
  );
}


'use client';

import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePortal, MOQ_MINIMO } from '@/app/portal/_contexts/PortalContext';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';

interface Props {
  onEnviar: (accion: 'borrador' | 'enviar') => void;
  isSending: boolean;
}

export function CotizadorPanel({ onEnviar, isSending }: Props) {
  const { items, resumen, actualizarCantidad, eliminarDelBorrador: eliminarItem } = usePortal();

  const itemsConMoqError = items.filter(i => i.cantidad < MOQ_MINIMO);
  const puedeEnviar      = items.length > 0 && itemsConMoqError.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">Cotización en curso</span>
        <span className="text-xs text-slate-400">{items.length} modelo{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
        {!items.length && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-slate-400">Sin productos</p>
            <p className="text-xs text-slate-300 mt-1">Busca y agrega productos</p>
          </div>
        )}

        {/* Banner de descuento */}
        {resumen.descuento_pct > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-emerald-700 font-medium">{resumen.descripcion_descuento}</p>
          </div>
        )}

        {/* Aviso de descuento próximo */}
        {resumen.descuento_pct === 0 && resumen.total_unidades >= 300 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[11px] text-blue-700">
            Agrega {(500 - resumen.total_unidades).toLocaleString()} uds más para 5% de descuento
          </div>
        )}

        {/* Lista de items */}
        {items.map(item => (
          <div key={`${item.variante_id}`} className={cn(
            'border rounded-md p-3 space-y-2',
            item.cantidad < MOQ_MINIMO ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100',
          )}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate">{item.nombre}</p>
                <p className="text-[11px] text-slate-400">{item.talla} · {item.color}</p>
              </div>
              <button
                onClick={() => eliminarItem(item.variante_id)}
                className="text-slate-300 hover:text-red-500 transition-colors ml-2 shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                <button
                  onClick={() => actualizarCantidad(item.variante_id, item.cantidad - 100)}
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >−</button>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={e => actualizarCantidad(item.variante_id, parseInt(e.target.value) || MOQ_MINIMO)}
                  className="w-16 text-center text-xs py-1 border-x border-slate-200 focus:outline-none"
                />
                <button
                  onClick={() => actualizarCantidad(item.variante_id, item.cantidad + 100)}
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >+</button>
              </div>
              <span className="text-xs font-medium text-slate-900">
                {formatCurrency(item.subtotal)}
              </span>
            </div>

            {item.cantidad < MOQ_MINIMO && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700">
                <AlertTriangle size={11} />
                Mínimo {MOQ_MINIMO.toLocaleString()} uds por modelo
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen financiero */}
      {items.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Subtotal ({resumen.total_unidades.toLocaleString()} uds)</span>
            <span>{formatCurrency(resumen.subtotal)}</span>
          </div>
          {resumen.descuento_pct > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <span>Descuento {resumen.descuento_pct}%</span>
              <span>− {formatCurrency(resumen.descuento_monto)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-500">
            <span>IGV 18%</span>
            <span>{formatCurrency(resumen.igv)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-900 pt-1.5 border-t border-slate-100">
            <span>Total</span>
            <span>{formatCurrency(resumen.total)}</span>
          </div>

          <div className="space-y-1.5 pt-2">
            <button
              onClick={() => onEnviar('enviar')}
              disabled={!puedeEnviar || isSending}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-40"
            >
              {isSending ? 'Enviando…' : 'Enviar cotización'}
            </button>
            <button
              onClick={() => onEnviar('borrador')}
              disabled={isSending}
              className="w-full py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors disabled:opacity-40"
            >
              Guardar borrador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
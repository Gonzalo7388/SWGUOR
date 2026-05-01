
'use client';

import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-sm font-medium text-slate-900">Cotización en curso</h2>
        <span 
          className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full"
          aria-label={`${items.length} modelo${items.length !== 1 ? 's' : ''} en cotización`}
        >
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto px-3 sm:px-4 py-3 space-y-2">
        {!items.length && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-slate-400">Sin productos</p>
            <p className="text-xs text-slate-300 mt-1">Busca y agrega productos</p>
          </div>
        )}

        {/* Banner de descuento activo */}
        {resumen.descuento_pct > 0 && (
          <div 
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-emerald-700 font-medium">{resumen.descripcion_descuento}</p>
          </div>
        )}

        {/* Aviso de descuento próximo */}
        {resumen.descuento_pct === 0 && resumen.total_unidades >= 300 && (
          <div 
            className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[11px] text-blue-700"
            role="complementary"
            aria-label="Próximo nivel de descuento"
          >
            Agrega {(500 - resumen.total_unidades).toLocaleString()} uds más para 5% de descuento
          </div>
        )}

        {/* Lista de items */}
        {items.map(item => (
          <article 
            key={`${item.variante_id}`} 
            className={cn(
              'border rounded-md p-3 space-y-2 transition-colors',
              item.cantidad < MOQ_MINIMO ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 hover:border-slate-200',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate">{item.nombre}</p>
                <p className="text-[11px] text-slate-400">{item.talla} · {item.color}</p>
              </div>
              <button
                onClick={() => eliminarItem(item.variante_id)}
                aria-label={`Eliminar ${item.nombre} de la cotización`}
                className="text-slate-300 hover:text-red-500 active:scale-110 transition-all ml-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                title="Eliminar producto"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-white">
                <button
                  onClick={() => actualizarCantidad(item.variante_id, Math.max(0, item.cantidad - 100))}
                  aria-label="Disminuir cantidad en 100 unidades"
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  −
                </button>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={e => actualizarCantidad(item.variante_id, parseInt(e.target.value) || MOQ_MINIMO)}
                  aria-label={`Cantidad de ${item.nombre}`}
                  className="w-16 text-center text-xs py-1 border-x border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min={MOQ_MINIMO}
                />
                <button
                  onClick={() => actualizarCantidad(item.variante_id, item.cantidad + 100)}
                  aria-label="Aumentar cantidad en 100 unidades"
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  +
                </button>
              </div>
              <span className="text-xs font-medium text-slate-900 whitespace-nowrap">
                {formatCurrency(item.subtotal)}
              </span>
            </div>

            {item.cantidad < MOQ_MINIMO && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700" role="alert">
                <AlertTriangle size={14} aria-hidden="true" />
                Mínimo {MOQ_MINIMO.toLocaleString()} uds requeridas
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Resumen financiero */}
      {items.length > 0 && (
        <div className="border-t border-slate-100 px-3 sm:px-4 py-3 space-y-1.5 bg-slate-50">
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
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total a pagar</span>
            <span className="text-lg text-blue-600">{formatCurrency(resumen.total)}</span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onEnviar('enviar')}
              disabled={!puedeEnviar || isSending}
              aria-busy={isSending}
              className={cn(
                "w-full py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                !isSending && "hover:bg-blue-700 active:scale-95"
              )}
              title={!puedeEnviar ? "Completa los requisitos mínimos para enviar" : "Enviar cotización"}
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Enviando…
                </span>
              ) : (
                'Enviar cotización'
              )}
            </button>
            <button
              onClick={() => onEnviar('borrador')}
              disabled={isSending}
              className={cn(
                "w-full py-2.5 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                !isSending && "hover:bg-slate-50 active:scale-95"
              )}
              title="Guardar como borrador para continuar después"
            >
              Guardar borrador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
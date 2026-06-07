'use client';

import { Eye, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatDateLong } from '@/lib/helpers/format-helpers';
import { formatearMontoPortal } from '@/lib/helpers/pago-confirmacion.helper';
import type { HistorialPagoFila } from '@/lib/schemas/portal-historial-pagos';

interface Props {
  filas: HistorialPagoFila[];
  loading: boolean;
  onVerDetalle: (fila: HistorialPagoFila) => void;
  onVerComprobante: (fila: HistorialPagoFila) => void;
}

export function HistorialPagosTable({
  filas,
  loading,
  onVerDetalle,
  onVerComprobante,
}: Props) {
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#c4a35a]" size={32} />
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
          Cargando transacciones...
        </p>
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <p className="font-bold text-slate-600 mb-2">Sin transacciones registradas</p>
        <p className="text-sm text-slate-400 max-w-sm">
          Cuando realices pagos de tus pedidos, aparecerán aquí con su comprobante asociado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left min-w-[880px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            {[
              'Pedido',
              'Fecha',
              'Estado pedido',
              'Estado pago',
              'Monto total',
              'Acciones',
            ].map((col) => (
              <th
                key={col}
                className={`px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${
                  col === 'Acciones' ? 'text-right' : ''
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila) => {
            const puedeVerComprobante =
              Boolean(fila.comprobante?.id) &&
              (fila.estado_pago === 'pagado' || fila.estado_pago === 'parcial');

            return (
              <tr key={fila.pedido_id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-black text-[#231e1d]">{fila.codigo}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">#{fila.pedido_id}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                  {formatDateLong(fila.fecha)}
                </td>
                <td className="px-5 py-4">
                  <EstadoBadge estado={fila.estado_pedido} tipo="pedido" />
                </td>
                <td className="px-5 py-4">
                  <EstadoBadge estado={fila.estado_pago} tipo="pago" />
                </td>
                <td className="px-5 py-4">
                  <p className="font-black text-[#231e1d] tabular-nums">
                    {formatearMontoPortal(fila.monto_total, fila.moneda)}
                  </p>
                  {fila.estado_pago === 'parcial' && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pagado: {formatearMontoPortal(fila.monto_pagado, fila.moneda)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                      onClick={() => onVerDetalle(fila)}
                    >
                      <Eye className="size-3.5 mr-1.5" />
                      Detalle
                    </Button>
                    {puedeVerComprobante ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-lg text-xs bg-[#231e1d] text-[#e4c28a] hover:bg-[#2f2927]"
                        onClick={() => onVerComprobante(fila)}
                      >
                        <FileDown className="size-3.5 mr-1.5" />
                        Comprobante
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium px-2">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Truck, X } from 'lucide-react';
import {
  ESTADO_DEVOLUCION_PROV_LABELS,
  MOTIVO_DEVOLUCION_PROV_LABELS,
} from '@/lib/constants/devoluciones-proveedor';
import type { DevolucionProveedorFila } from '@/lib/schemas/devoluciones-proveedor';
import type { EstadoDevolucionProv, MotivoDevolucionProv } from '@prisma/client';

interface Props {
  open: boolean;
  devolucionId: string | number | null;
  onClose: () => void;
  onLoad: (id: string | number) => Promise<DevolucionProveedorFila>;
}

export function DevolucionProveedorDetailModal({
  open,
  devolucionId,
  onClose,
  onLoad,
}: Props) {
  const [detalle, setDetalle] = useState<DevolucionProveedorFila | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !devolucionId) {
      setDetalle(null);
      setError('');
      return;
    }

    let mounted = true;
    setLoading(true);
    onLoad(devolucionId)
      .then((data) => {
        if (mounted) setDetalle(data);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, devolucionId, onLoad]);

  if (!open) return null;

  const motivoKey = detalle?.motivo as MotivoDevolucionProv | undefined;
  const estadoKey = detalle?.estado as EstadoDevolucionProv | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Devolución #{devolucionId}</h2>
              <p className="text-xs text-slate-500">Detalle de devolución a proveedor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-12 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando...
            </div>
          ) : detalle ? (
            <dl className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Proveedor</dt>
                  <dd className="font-medium mt-1">{detalle.proveedores?.razon_social ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Tipo</dt>
                  <dd className="font-medium mt-1 capitalize">{detalle.tipo_recurso}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Recurso</dt>
                  <dd className="font-medium mt-1">
                    {detalle.tipo_recurso === 'material'
                      ? detalle.material?.nombre
                      : detalle.insumo?.nombre}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Cantidad</dt>
                  <dd className="font-medium mt-1">{Number(detalle.cantidad)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Motivo</dt>
                  <dd className="font-medium mt-1">
                    {motivoKey ? MOTIVO_DEVOLUCION_PROV_LABELS[motivoKey] : detalle.motivo}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Estado</dt>
                  <dd className="font-medium mt-1">
                    {estadoKey ? ESTADO_DEVOLUCION_PROV_LABELS[estadoKey] : detalle.estado}
                  </dd>
                </div>
              </div>

              {detalle.orden_id && (
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Orden de compra</dt>
                  <dd className="font-medium mt-1">#{detalle.orden_id}</dd>
                </div>
              )}

              {detalle.monto_estimado_recuperar != null && (
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Monto a recuperar</dt>
                  <dd className="font-medium mt-1">
                    S/ {Number(detalle.monto_estimado_recuperar).toFixed(2)}
                  </dd>
                </div>
              )}

              {detalle.observaciones && (
                <div>
                  <dt className="text-xs font-bold text-slate-400 uppercase">Observaciones</dt>
                  <dd className="mt-1 text-slate-600 whitespace-pre-wrap">{detalle.observaciones}</dd>
                </div>
              )}

              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase">Registrado</dt>
                <dd className="font-medium mt-1">
                  {new Date(detalle.created_at).toLocaleString('es-PE')}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-rose-600">{error || 'No se pudo cargar el detalle'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

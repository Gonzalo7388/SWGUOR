'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, Building2, Calendar, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ESTADOS_ORDEN_COMPRA,
  ESTADOS_PAGO_ORDEN_COMPRA,
} from '@/lib/constants/estados';
import { formatNumeroOc } from '@/lib/helpers/ordenes-compra-helpers';
import { useOrdenCompraDetalle, useOrdenesCompra } from '@/lib/hooks/useOrdenesCompra';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { toast } from 'sonner';
import type { OrdenCompraRow } from '@/components/admin/ordenes-compra/types';

export default function OrdenCompraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = usePermissions();
  const { data, isLoading, error } = useOrdenCompraDetalle(id);
  const { confirmar, cancelar, isConfirming, isCancelling } = useOrdenesCompra({
    enabled: false,
  });

  const orden = data as OrdenCompraRow | null;
  const canEdit = can('edit', 'ordenes_compra');
  const canCancelOrd = can('cancel', 'ordenes_compra');

  const handleConfirmar = async () => {
    try {
      await confirmar(id);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Cancelar esta orden?')) return;
    try {
      await cancelar(id);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Orden no encontrada</p>
        <Link href="/admin/Panel-Administrativo/ordenes-compra">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  const est = ESTADOS_ORDEN_COMPRA[orden.estado];
  const pago = ESTADOS_PAGO_ORDEN_COMPRA[orden.estado_pago];

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/Panel-Administrativo/ordenes-compra">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {formatNumeroOc(orden.id)}
              </h1>
              <p className="text-sm text-slate-500">{orden.proveedores?.razon_social}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && orden.estado === 'pendiente' && (
              <Button
                onClick={handleConfirmar}
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar
              </Button>
            )}
            {canCancelOrd &&
              orden.estado !== 'cancelada' &&
              orden.estado !== 'completada' && (
                <Button
                  variant="destructive"
                  onClick={handleCancelar}
                  disabled={isCancelling}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Cancelar
                </Button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card icon={Building2} label="Proveedor" value={orden.proveedores?.razon_social ?? '—'} />
          <Card
            icon={Calendar}
            label="F. prometida"
            value={
              orden.fecha_prometida
                ? new Date(orden.fecha_prometida).toLocaleDateString('es-PE')
                : '—'
            }
          />
          <Card
            icon={FileText}
            label="Estado / Pago"
            value={`${est?.label ?? orden.estado} · ${pago?.label ?? orden.estado_pago}`}
          />
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between mb-6">
            <h2 className="font-bold text-slate-900">Ítems</h2>
            <p className="text-xl font-black text-slate-900">
              S/ {Number(orden.total_orden).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase text-gray-400 border-b">
                <th className="pb-2">Descripción</th>
                <th className="pb-2 text-right">Cant.</th>
                <th className="pb-2 text-right">P. unit.</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(orden.ordenes_compra_items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-3">
                    {item.materiales?.nombre ?? item.insumo?.nombre ?? '—'}
                    <span className="ml-2 text-[10px] text-slate-400 uppercase">
                      {item.material_id ? 'Material' : 'Insumo'}
                    </span>
                  </td>
                  <td className="py-3 text-right">{Number(item.cantidad_pedida)}</td>
                  <td className="py-3 text-right">
                    S/ {Number(item.precio_unitario).toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    S/ {Number(item.subtotal ?? item.cantidad_pedida * item.precio_unitario).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orden.notas && (
            <p className="mt-4 text-sm text-slate-600 border-t pt-4">
              <strong>Notas:</strong> {orden.notas}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex gap-3">
      <Icon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

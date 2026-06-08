'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Package, ShoppingBag } from 'lucide-react';
import {
  PedidoConDetalles,
} from '@/components/portal/pedidos/PedidoModalDetalle';
import { PedidoDetalleResumen } from '@/components/portal/pedidos/PedidoDetalleResumen';
import { PedidoDetalleTabs } from '@/components/portal/pedidos/PedidoDetalleTabs';
import type { EstadoPedido } from '@/components/portal/pedidos/types';

export default function PedidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = String(params.id ?? '');

  const [pedido, setPedido] = useState<PedidoConDetalles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabInicial = searchParams.get('tab') === 'documentos' ? 'documentos' : 'resumen';

  useEffect(() => {
    if (!pedidoId) return;

    const fetchPedido = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/portal/pedidos/${pedidoId}`, { cache: 'no-store' });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? 'Pedido no encontrado');
        }

        const data = json.data;
        setPedido({
          id: Number(data.id),
          total: Number(data.total ?? 0),
          estado: (data.estado ?? 'pendiente') as EstadoPedido,
          estado_pago: data.estado_pago ?? 'pendiente',
          created_at: data.created_at,
          total_unidades: Number(data.total_unidades ?? 0),
          moneda: data.moneda ?? 'PEN',
          monto_pagado: Number(data.monto_pagado ?? 0),
          saldo_pendiente: Number(data.saldo_pendiente ?? 0),
          direccion_envio: data.direccion_despacho ?? null,
          notas: data.notas_cliente ?? data.notas_pedido ?? null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [pedidoId]);

  const buildPagoUrl = useCallback(() => {
    if (!pedido) return '/portal/pedidos';
    const saldo =
      Number(pedido.saldo_pendiente ?? 0) > 0
        ? Number(pedido.saldo_pendiente)
        : Math.max(Number(pedido.total ?? 0) - Number(pedido.monto_pagado ?? 0), 0);
    const paramsUrl = new URLSearchParams({
      total: String(Number(pedido.total ?? 0)),
      saldo: String(saldo),
      cantidad: String(Number(pedido.total_unidades ?? 0)),
      nombre: `Pedido #${pedido.id}`,
      moneda: String(pedido.moneda ?? 'PEN'),
    });
    return `/portal/pago/${pedido.id}?${paramsUrl.toString()}`;
  }, [pedido]);

  const fechaFormateada = pedido
    ? new Date(pedido.created_at).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const saldoPendiente = Number(pedido?.saldo_pendiente ?? 0);
  const montoPagado = Number(pedido?.monto_pagado ?? 0);
  const puedePagar = pedido && saldoPendiente > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#b5854b] mb-3" />
        <p className="text-sm font-medium">Cargando detalle del pedido...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error ?? 'Pedido no disponible'}</p>
        <Link
          href="/portal/pedidos"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#b5854b] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 pb-12">
      <div className="flex flex-col gap-4">
        <Link
          href="/portal/pedidos"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#231e1d] w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#231e1d] text-[#e4c28a] shadow-lg">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#231e1d]">Pedido #{pedido.id}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Registrado el {fechaFormateada}</p>
            </div>
          </div>

          {puedePagar && (
            <button
              type="button"
              onClick={() => router.push(buildPagoUrl())}
              className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] text-white shadow-md flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: 'var(--guor-dark)' }}
            >
              <ShoppingBag size={14} style={{ color: 'var(--guor-gold)' }} />
              {montoPagado > 0 ? 'Abonar saldo' : 'Pagar pedido'}
            </button>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm"
        style={{ borderColor: 'var(--guor-stone)' }}
      >
        <PedidoDetalleTabs
          pedidoId={pedido.id}
          defaultTab={tabInicial}
          resumen={<PedidoDetalleResumen pedido={pedido} />}
        />
      </div>
    </div>
  );
}

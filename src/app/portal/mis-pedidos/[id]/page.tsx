'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { PedidoDetallePageView } from '@/components/portal/pedidos/PedidoDetallePageView';
import { usePortalPedidoDetalle } from '@/lib/hooks/usePortalPedidoDetalle';

export default function PedidoDetallePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pedidoId = String(params.id ?? '');
  const tabInicial = searchParams.get('tab') === 'documentos' ? 'documentos' : 'resumen';

  const { pedido, loading, error } = usePortalPedidoDetalle(pedidoId);

  return (
    <PedidoDetallePageView
      pedido={pedido}
      loading={loading}
      error={error}
      backHref="/portal/pedidos"
      backLabel="Volver a mis pedidos"
      defaultTab={tabInicial}
    />
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { PedidoDetalleHeader } from './PedidoDetalleHeader';
import { PedidoDetalleSecciones } from './PedidoDetalleSecciones';
import { PedidoDetalleTabs } from './PedidoDetalleTabs';
import OrdenesTable from '@/components/admin/ordenes-produccion/OrdenesTable';
import { SectionCard } from './PedidoDetalleUI';
import type { DetallePedidoData, TallerOption } from './types';

export type { DetallePedidoData, TallerOption };

interface PedidoDetalleProps {
  pedido: DetallePedidoData;
  puedeCambiarEstado: boolean;
}

export default function PedidoDetalle({
  pedido,
  puedeCambiarEstado,
}: PedidoDetalleProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'seguimiento' | 'produccion' | 'pagos'>('items');
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [totalOrdenes, setTotalOrdenes] = useState<number>(0);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);

  useEffect(() => {
    // Obtener el conteo total de órdenes para el badge y, si la pestaña está activa, la lista
    async function fetchOrdenesCount() {
      try {
        const res = await fetch(`/api/admin/ordenes-produccion?pedido_id=${pedido.id}&page=1&limit=1`);
        const json = await res.json();
        if (json?.meta?.total != null) {
          setTotalOrdenes(Number(json.meta.total));
        }
      } catch (e) {
        console.error('Error fetching ordenes count', e);
      }
    }

    fetchOrdenesCount();
  }, [pedido.id]);

  useEffect(() => {
    if (activeTab !== 'produccion') return;
    let mounted = true;
    async function fetchOrdenes() {
      setLoadingOrdenes(true);
      try {
        const res = await fetch(`/api/admin/ordenes-produccion?pedido_id=${pedido.id}&page=1&limit=50`);
        const json = await res.json();
        if (mounted && json?.ordenes) {
          setOrdenes(json.ordenes);
        }
      } catch (e) {
        console.error('Error fetching ordenes', e);
      } finally {
        if (mounted) setLoadingOrdenes(false);
      }
    }

    fetchOrdenes();
    return () => { mounted = false; };
  }, [activeTab, pedido.id]);

  return (
    <div className="max-w-[96rem] mx-auto px-4 py-6 space-y-5">
      <PedidoDetalleHeader pedido={pedido} />

      <div className="flex items-center justify-between">
        <PedidoDetalleTabs
          activeTab={activeTab === 'pagos' ? 'pagos' : (activeTab as any)}
          totalOrdenes={totalOrdenes}
          onTabChange={(t) => setActiveTab(t)}
        />
      </div>

      {activeTab === 'produccion' ? (
        <SectionCard title={`Órdenes de Producción (${totalOrdenes})`}>
          {loadingOrdenes ? (
            <div className="text-sm text-stone-500 py-6 text-center">Cargando órdenes...</div>
          ) : (
            <OrdenesTable
              data={ordenes}
              onView={(id) => window.location.assign(`/admin/Panel-Administrativo/ordenes-produccion/${id}`)}
              onEtapas={(id) => window.location.assign(`/admin/Panel-Administrativo/ordenes-produccion/${id}`)}
              onEdit={(orden) => window.location.assign(`/admin/Panel-Administrativo/ordenes-produccion/${orden.id}`)}
            />
          )}
        </SectionCard>
      ) : (
        <PedidoDetalleSecciones
          pedido={pedido}
          puedeCambiarEstado={puedeCambiarEstado}
        />
      )}
    </div>
  );
}

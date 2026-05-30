'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, PackageSearch } from 'lucide-react';

import { usePortal } from '@/lib/hooks/usePortal';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { PedidoKpis } from '@/components/portal/pedidos/PedidoKpis';
import { PedidoCard, Pedido } from '@/components/portal/pedidos/PedidoCard';
import { PedidoSkeleton } from '@/components/portal/pedidos/PedidoSkeleton';
import { PedidoModalPago } from '@/components/portal/pedidos/PedidoModalPago';
import { PedidoModalDetalle, PedidoConDetalles } from '@/components/portal/pedidos/PedidoModalDetalle';

interface PedidoFilaDB {
  id: string;
  total: number;
  estado: string;
  created_at: string;
  total_unidades: number;
  moneda: string;
  monto_pagado: number;
  saldo_pendiente: number;
}

export default function HistorialPedidosPortalPage() {
  const portal = usePortal();
  const usuarioComercial = portal && 'user' in portal ? portal.user : null;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pedidoPago, setPedidoPago] = useState<Pedido | null>(null);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoConDetalles | null>(null);

  const cargarHistorialB2B = useCallback(async (mostrarInstante = false) => {
    if (mostrarInstante) setRefreshing(true);
    else setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('pedidos')
        .select('id, total, estado, created_at, total_unidades, moneda, monto_pagado, saldo_pendiente')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filasFiltradas = (data as unknown as PedidoFilaDB[] | null) || [];

      const pedidosFormateados: Pedido[] = filasFiltradas.map((p) => {
        let estadoPagoCalculado: Pedido['estado_pago'] = 'pendiente';
        if (Number(p.saldo_pendiente) <= 0 && Number(p.monto_pagado) > 0) {
          estadoPagoCalculado = 'verificado';
        }

        return {
          id: Number(p.id),
          total: Number(p.total),
          estado: (p.estado as Pedido['estado']) || 'pendiente',
          estado_pago: estadoPagoCalculado,
          created_at: p.created_at,
          total_unidades: p.total_unidades || 0,
          moneda: p.moneda || 'PEN'
        };
      });

      setPedidos(pedidosFormateados);
    } catch (err: unknown) {
      console.error('Error crítico al recopilar el historial de manufactura:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorialB2B();
  }, [cargarHistorialB2B]);

  const kpisCalculados = useMemo(() => {
    return {
      total: pedidos.length,
      activos: pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_produccion').length,
      listos: pedidos.filter(p => p.estado === 'listo_para_despacho').length,
      entregados: pedidos.filter(p => p.estado === 'entregado').length
    };
  }, [pedidos]);

  const handlePagar = (pedido: Pedido) => {
    setPedidoPago(pedido);
  };

  const handleVerDetalle = (pedidoBase: Pedido) => {
    const detalleExtendido: PedidoConDetalles = {
      ...pedidoBase,
      direccion_envio: null,
      notas: null,
      items: []
    };
    setPedidoDetalle(detalleExtendido);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4">

      {/* HEADER: Fila de arriba */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 text-white rounded-2xl shadow-lg bg-guor-gold shadow-guor-gold/30">
            <PackageSearch size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Mis Pedidos</h1>
            <p className="text-sm text-slate-500">
              Cuenta de: {usuarioComercial ? 'Socio Corporativo GUOR' : 'Portal B2B'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => cargarHistorialB2B(true)}
            disabled={refreshing || loading}
            className="h-10 w-10 border rounded-xl flex items-center justify-center bg-white hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-40 shadow-xs cursor-pointer"
            style={{ borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)' }}
            title="Sincronizar con ERP Logístico"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/portal/catalogo"
            className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--guor-dark)' }}
          >
            <Plus size={14} style={{ color: 'var(--guor-gold)' }} />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      {/* BLOQUE DE CONTENIDO: KPIs y Listado */}
      {!loading && (
        <div className="animate-in fade-in duration-300">
          <PedidoKpis
            total={kpisCalculados.total}
            activos={kpisCalculados.activos}
            listos={kpisCalculados.listos}
            entregados={kpisCalculados.entregados}
          />
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <PedidoSkeleton />
            <PedidoSkeleton />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 bg-gray-50/50" style={{ borderColor: 'var(--guor-stone)' }}>
            <div className="p-4 rounded-full border bg-white" style={{ borderColor: 'var(--guor-stone)' }}>
              <PackageSearch size={32} style={{ color: 'var(--guor-gold)' }} />
            </div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--guor-dark)' }}>
              Sin Órdenes de Manufactura
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in-50 duration-300">
            {pedidos.map((pedido, i) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                index={i}
                onVerDetalle={handleVerDetalle}
                onPagar={handlePagar}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALES */}
      {pedidoPago && (
        <PedidoModalPago
          pedido={pedidoPago}
          onClose={() => setPedidoPago(null)}
        />
      )}

      <PedidoModalDetalle
        pedido={pedidoDetalle}
        isOpen={pedidoDetalle !== null}
        onClose={() => setPedidoDetalle(null)}
        onPagar={handlePagar}
      />
    </div>
  );
}
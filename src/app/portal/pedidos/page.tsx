'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowUpRight,
  PackageSearch,
  RefreshCw,
  Plus,
  FileText,
} from 'lucide-react';

import { usePortal } from '@/lib/hooks/usePortal';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { useRouter } from 'next/navigation';


// ─── Componentes del módulo ───────────────────────────────────────────────────
import { PedidoCard } from '@/components/portal/pedidos/PedidoCard';
import { PedidoKpis } from '@/components/portal/pedidos/PedidoKpis';
import { PedidoSkeleton } from '@/components/portal/pedidos/PedidoSkeleton';
import { PedidosEmpty } from '@/components/portal/pedidos/PedidosEmpty';
import { PedidosError } from '@/components/portal/pedidos/PedidosError';
import { PedidoAvisoPago } from '@/components/portal/pedidos/PedidoAvisoPago';
import { PedidoModalDetalle, PedidoConDetalles } from '@/components/portal/pedidos/PedidoModalDetalle';
// ─── Tipos ────────────────────────────────────────────────────────────────────
import {
  Pedido,
  PedidoFilaDB,
  EstadoPago,
  EstadoPedido,
  CotizacionHistorial,
} from '@/components/portal/pedidos/types';

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MisPedidosPage() {
  const { cliente, loading: authLoading } = usePortal() as {
    cliente: { id: string } | null;
    loading: boolean;
  };

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoConDetalles | null>(null);
  const router = useRouter();
  // ─── Cotizaciones recientes (máx 3) ───────────────────────────────────────
  const cotizacionesRecientes = useMemo(
    () => cotizaciones.slice(0, 3),
    [cotizaciones],
  );

  // ─── KPIs calculados ──────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total: pedidos.length,
    activos: pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_produccion').length,
    listos: pedidos.filter(p => p.estado === 'listo_para_despacho').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
  }), [pedidos]);

  // ─── Fetch de datos ───────────────────────────────────────────────────────
  const fetchPedidos = useCallback(async () => {
    if (!cliente?.id) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const [pedidosResult, cotizacionesResult] = await Promise.all([
        supabase
          .from('pedidos')
          .select('id, total, estado, created_at, total_unidades, moneda, saldo_pendiente, monto_pagado')
          .eq('cliente_id', cliente.id as unknown as number)
          .order('created_at', { ascending: false }),
        supabase
          .from('cotizaciones')
          .select('id, numero, total, estado, created_at, costo_envio')
          .eq('cliente_id', cliente.id as unknown as number)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (pedidosResult.error) throw pedidosResult.error;
      if (cotizacionesResult.error) throw cotizacionesResult.error;

      // Supabase infiere tipos desde el schema generado; usamos `unknown` como
      // paso intermedio para evitar TS2352 cuando los tipos no solapan del todo.
      const filas = (pedidosResult.data as unknown as PedidoFilaDB[] | null) ?? [];

      const pedidosFormateados: Pedido[] = filas.map((p) => {
        const estadoPago: EstadoPago =
          Number(p.saldo_pendiente) <= 0 && Number(p.monto_pagado) > 0
            ? 'verificado'
            : 'pendiente';

        return {
          id: p.id,
          total: Number(p.total),
          estado: ((p.estado ?? 'pendiente') as EstadoPedido),
          estado_pago: estadoPago,
          created_at: p.created_at ?? new Date().toISOString(),
          total_unidades: p.total_unidades || 0,
          moneda: p.moneda || 'PEN',
        };
      });

      setPedidos(pedidosFormateados);
      setCotizaciones(
        (cotizacionesResult.data as unknown as CotizacionHistorial[]) ?? [],
      );
    } catch (err: unknown) {
      console.error('Error al recopilar el historial:', err);
      setError('No se pudieron cargar los pedidos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [cliente?.id]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // ─── Handlers de modales ──────────────────────────────────────────────────

  /** Abre el modal de detalle con la información del pedido */
  const handleVerDetalle = useCallback((pedido: Pedido) => {
    // PedidoConDetalles extiende Pedido; los campos opcionales se rellenarán
    // cuando se implemente la carga de ítems detallados desde Supabase.
    setPedidoDetalle(pedido as PedidoConDetalles);
  }, []);

  /** Desde la tarjeta: abre directamente el modal de pago */
  const handlePagarDesdeCard = useCallback((pedido: Pedido) => {
    const params = new URLSearchParams({
      total: String(Number(pedido.total ?? 0)),
      cantidad: String(Number(pedido.total_unidades ?? 0)),
      nombre: `Pedido #${pedido.id}`,
      moneda: String(pedido.moneda ?? 'PEN'),
    });
    router.push(`/portal/pago/${pedido.id}?${params.toString()}`);
}, [router]);

  /** Desde el modal de detalle: cierra detalle y abre pago */
  const handlePagarDesdeDetalle = useCallback((pedido: Pedido) => {
    setPedidoDetalle(null);
    const params = new URLSearchParams({
      total: String(Number(pedido.total ?? 0)),
      cantidad: String(Number(pedido.total_unidades ?? 0)),
      nombre: `Pedido #${pedido.id}`,
      moneda: String(pedido.moneda ?? 'PEN'),
    });
    router.push(`/portal/pago/${pedido.id}?${params.toString()}`);
  }, [router]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 text-white rounded-2xl shadow-lg bg-guor-gold shadow-guor-gold/30">
              <PackageSearch size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Mis Pedidos</h1>
              <p className="text-sm text-slate-500">
                {cliente ? 'Socio Corporativo GUOR' : 'Portal B2B'}
              </p>
            </div>
          </div>

          <Link
            href="/portal/catalogo"
            className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--guor-dark)' }}
          >
            <Plus size={14} style={{ color: 'var(--guor-gold)' }} />
            Nueva Solicitud
          </Link>
        </div>

        {/* ── KPIs ───────────────────────────────────────────────────────── */}
        {!loading && !error && pedidos.length > 0 && (
          <PedidoKpis
            total={kpis.total}
            activos={kpis.activos}
            listos={kpis.listos}
            entregados={kpis.entregados}
          />
        )}

        {/* ── AVISO PAGOS PENDIENTES ──────────────────────────────────────── */}
        {!loading && !error && (
          <PedidoAvisoPago pedidos={pedidos} />
        )}

        {/* ── LISTA DE PEDIDOS ────────────────────────────────────────────── */}
        {loading || authLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <PedidoSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <PedidosError mensaje={error} onReintentar={fetchPedidos} />
        ) : pedidos.length === 0 ? (
          <PedidosEmpty />
        ) : (
          <div className="space-y-2.5">
            {pedidos.map((pedido, i) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                index={i}
                onVerDetalle={handleVerDetalle}
                onPagar={handlePagarDesdeCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL DETALLE ─────────────────────────────────────────────────── */}
      <PedidoModalDetalle
        pedido={pedidoDetalle}
        isOpen={pedidoDetalle !== null}
        onClose={() => setPedidoDetalle(null)}
        onPagar={handlePagarDesdeDetalle}
      />
    </>
  );
}
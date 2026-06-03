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
import { PedidoModalPago } from '@/components/portal/pedidos/PedidoModalPago';

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
  router.push(`/portal/pago/${pedido.id}`);
}, [router]);

  /** Desde el modal de detalle: cierra detalle y abre pago */
  const handlePagarDesdeDetalle = useCallback((pedido: Pedido) => {
    setPedidoDetalle(null);
    router.push(`/portal/pago/${pedido.id}`);
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

        {/* ── HISTORIAL DE COTIZACIONES ───────────────────────────────────── */}
        {!loading && !error && (
          <div className="bg-white border border-[#e4c28a]/25 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#e4c28a]/15">
              <div>
                <h2 className="text-[11px] font-black text-[#231e1d] uppercase tracking-[0.18em]">
                  Historial de cotizaciones
                </h2>
                <p className="text-[10px] text-[#b5854b]/50 font-medium mt-0.5">
                  Guardadas automáticamente al enviar cotización
                </p>
              </div>
              <Link
                href="/portal/cotizaciones"
                className="group flex items-center gap-1 text-[11px] font-bold text-[#b5854b] hover:text-[#231e1d] transition-colors"
              >
                Ver todo
                <ArrowUpRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </div>

            <div className="p-3">
              {cotizacionesRecientes.length > 0 ? (
                <div className="space-y-2">
                  {cotizacionesRecientes.map((cot: CotizacionHistorial) => (
                    <Link
                      key={cot.id}
                      href={`/portal/cotizaciones/${cot.id}`}
                      className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#e4c28a]/20 bg-white hover:bg-[#fff4e2]/40 hover:border-[#e4c28a]/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#e4c28a]/15 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-[#b5854b]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#231e1d] truncate">
                            {cot.numero}
                          </p>
                          <p className="text-[10px] font-medium text-[#231e1d]/35 truncate">
                            {new Date(cot.created_at ?? new Date().toISOString()).toLocaleDateString('es-PE', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}{' '}
                            · Envío {formatCurrency(cot.costo_envio)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-bold text-[#b5854b]/40 uppercase tracking-widest">
                            Total
                          </p>
                          <p className="text-sm font-black text-[#231e1d] tabular-nums">
                            {formatCurrency(cot.total)}
                          </p>
                        </div>
                        <EstadoBadge estado={cot.estado ?? 'borrador'} tipo="cotizacion" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#e4c28a]/10 flex items-center justify-center">
                    <FileText size={16} className="text-[#b5854b]/30" />
                  </div>
                  <p className="text-[10px] font-bold text-[#231e1d]/25 uppercase tracking-widest">
                    Sin cotizaciones aún
                  </p>
                  <p className="text-[11px] text-[#231e1d]/20 font-medium text-center">
                    Cuando envíes una cotización se guardará automáticamente aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
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
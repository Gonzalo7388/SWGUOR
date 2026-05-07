'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, ArrowUpRight, Calendar,
  PackageSearch, RefreshCw, ChevronRight,
  Layers, Clock, CheckCircle2, XCircle, Truck,
  Plus, CreditCard, X, CheckCircle, AlertCircle,
  Receipt, Banknote, Smartphone, FileText,
} from 'lucide-react';

import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoPedido = 'pendiente' | 'en_produccion' | 'listo_para_despacho' | 'entregado' | 'cancelado';
type EstadoPago   = 'pendiente' | 'verificado' | 'rechazado';

interface Pedido {
  id: number;
  total: number;
  estado: EstadoPedido;
  estado_pago: EstadoPago;
  created_at: string;
  total_unidades: number;
  moneda: string;
}

interface CotizacionHistorial {
  id: number;
  numero: string;
  total: number;
  costo_envio: number;
  estado: string;
  created_at: string;
  valida_hasta: string;
}

// ─── Métodos de pago ──────────────────────────────────────────────────────────

const METODOS_PAGO = [
  {
    id: 'yape',
    nombre: 'Yape',
    descripcion: 'Pago inmediato con código QR',
    imagen: '/images/yape.png',
    icon: Smartphone,
    color: '#6C3CE1',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    tag: 'Más usado',
  },
  {
    id: 'tarjeta',
    nombre: 'Tarjeta de Débito / Crédito',
    descripcion: 'Visa, Mastercard, American Express',
    imagen: '/images/visa.png',
    icon: CreditCard,
    color: '#1A56DB',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    tag: null,
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia Bancaria',
    descripcion: 'BCP, Interbank, BBVA, Scotiabank',
    imagen: '/images/transferencia.png',
    icon: Banknote,
    color: '#057A55',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    tag: null,
  },
];

// ─── Metadatos visuales de estado ────────────────────────────────────────────

const ESTADO_META: Record<EstadoPedido, {
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  label: string;
}> = {
  pendiente:           { icon: Clock,        bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   label: 'Pendiente'          },
  en_produccion:       { icon: Layers,       bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    label: 'En producción'       },
  listo_para_despacho: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Listo para despacho' },
  entregado:           { icon: Truck,        bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-100',    label: 'Entregado'           },
  cancelado:           { icon: XCircle,      bg: 'bg-rose-50',    text: 'text-rose-500',    border: 'border-rose-100',    label: 'Cancelado'           },
};

const PAGO_META: Record<EstadoPago, { label: string; dot: string; bg: string; text: string }> = {
  pendiente:  { label: 'Pago pendiente',  dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-600'   },
  verificado: { label: 'Pago verificado', dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  rechazado:  { label: 'Pago rechazado',  dot: 'bg-rose-400',    bg: 'bg-rose-50',    text: 'text-rose-500'    },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Pulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-[#e4c28a]/15', className)} />;
}

function PedidoSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#e4c28a]/20 animate-pulse">
      <Pulse className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3 w-28" />
        <Pulse className="h-2.5 w-40" />
      </div>
      <Pulse className="hidden sm:block h-4 w-20" />
      <Pulse className="hidden md:block h-6 w-24 rounded-full" />
      <Pulse className="w-8 h-8 rounded-lg flex-shrink-0" />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between p-5 rounded-2xl border bg-white',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
      )}
      style={{ borderColor: `${accent}30` }}
    >
      <p className="text-4xl font-black tabular-nums leading-none mb-2" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: `${accent}80` }}>
        {label}
      </p>
    </div>
  );
}

// ─── Modal Detalle ────────────────────────────────────────────────────────────

function ModalDetalle({
  pedido,
  onClose,
  onPagar,
}: {
  pedido: Pedido;
  onClose: () => void;
  onPagar: () => void;
}) {
  const estado  = ESTADO_META[pedido.estado]    ?? ESTADO_META.pendiente;
  const pago    = PAGO_META[pedido.estado_pago] ?? PAGO_META.pendiente;
  const Icon    = estado.icon;
  const isPending = pedido.estado_pago === 'pendiente';

  const fecha = new Date(pedido.created_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const total = Number(pedido.total ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#231e1d] to-[#3d3128] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', estado.bg, estado.border)}>
              <Icon size={16} className={estado.text} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#e4c28a]/60 uppercase tracking-widest">Detalle del pedido</p>
              <p className="font-black text-lg text-[#e4c28a]">Pedido #{pedido.id}</p>
            </div>
          </div>

          <div className="text-4xl font-black text-white mb-1">
            {pedido.moneda ?? 'PEN'} {total}
          </div>
          <p className="text-sm text-white/50">{pedido.total_unidades} unidades · {fecha}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estado de producción</p>
              <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', estado.bg, estado.text)}>
                <Icon size={11} />
                {estado.label}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estado de pago</p>
              <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', pago.bg, pago.text)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', pago.dot)} />
                {pago.label}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Número de pedido</span>
                <span className="font-bold text-[#b5854b]">#{pedido.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de creación</span>
                <span className="font-semibold text-slate-700">{fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unidades</span>
                <span className="font-semibold text-slate-700">{pedido.total_unidades.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moneda</span>
                <span className="font-semibold text-slate-700">{pedido.moneda ?? 'PEN'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-700">Total</span>
                <span className="font-black text-[#231e1d]">{pedido.moneda ?? 'PEN'} {total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
          >
            Cerrar
          </button>

          {isPending && (
            <button
              onClick={onPagar}
              className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={14} />
              Pagar ahora
            </button>
          )}

          <Link
            href={`/portal/pedidos/${pedido.id}`}
            className="px-4 py-3 rounded-2xl bg-[#e4c28a]/20 hover:bg-[#e4c28a]/30 text-[#b5854b] text-sm font-bold transition-colors flex items-center gap-1"
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Pasarela de Pagos ──────────────────────────────────────────────────

type PasosPago = 'seleccion' | 'confirmacion' | 'procesando' | 'exito' | 'error';

function ModalPago({
  pedido,
  onClose,
}: {
  pedido: Pedido;
  onClose: () => void;
}) {
  const [paso, setPaso]         = useState<PasosPago>('seleccion');
  const [metodo, setMetodo]     = useState<string | null>(null);

  const total = Number(pedido.total ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const metodoSeleccionado = METODOS_PAGO.find(m => m.id === metodo);

  const handleConfirmar = async () => {
    setPaso('procesando');
    // Aquí iría la lógica real de pago — simulamos 2s de procesamiento
    await new Promise(r => setTimeout(r, 2000));
    // Simular éxito (reemplazar con lógica real)
    setPaso('exito');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >

        {/* ── PASO 1: Selección de método ─────────────────────────────── */}
        {paso === 'seleccion' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b] uppercase tracking-widest">Pasarela de pago</p>
                <h2 className="text-xl font-black text-[#231e1d]">Selecciona método</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Resumen */}
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b]/60 uppercase tracking-wider">Pedido #{pedido.id}</p>
                <p className="font-black text-[#231e1d] text-lg">{pedido.moneda ?? 'PEN'} {total}</p>
              </div>
              <Receipt size={20} className="text-[#b5854b]/40" />
            </div>

            {/* Métodos */}
            <div className="p-6 space-y-3">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 relative',
                    metodo === m.id
                      ? 'border-[#b5854b] bg-[#fff4e2] shadow-md shadow-[#b5854b]/10'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  {/* Logo */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', m.bg)}>
                    <Image
                      src={m.imagen}
                      alt={m.nombre}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#231e1d] text-sm">{m.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.descripcion}</p>
                  </div>

                  {/* Tag */}
                  {m.tag && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#b5854b] text-white px-2 py-1 rounded-full">
                      {m.tag}
                    </span>
                  )}

                  {/* Check */}
                  {metodo === m.id && (
                    <div className="w-5 h-5 rounded-full bg-[#b5854b] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Botones */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!metodo}
                onClick={() => setPaso('confirmacion')}
                className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: Confirmación ────────────────────────────────────── */}
        {paso === 'confirmacion' && metodoSeleccionado && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b] uppercase tracking-widest">Confirmar pago</p>
                <h2 className="text-xl font-black text-[#231e1d]">Resumen</h2>
              </div>
              <button onClick={() => setPaso('seleccion')} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Monto */}
              <div className="text-center py-6 bg-gradient-to-br from-[#fff4e2] to-[#fde8c0] rounded-2xl border border-[#e4c28a]/40">
                <p className="text-xs font-bold text-[#b5854b]/60 uppercase tracking-widest mb-1">Monto a pagar</p>
                <p className="text-4xl font-black text-[#231e1d]">{pedido.moneda ?? 'PEN'} {total}</p>
                <p className="text-xs text-[#b5854b]/60 mt-1">Pedido #{pedido.id}</p>
              </div>

              {/* Método elegido */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', metodoSeleccionado.bg)}>
                  <Image src={metodoSeleccionado.imagen} alt={metodoSeleccionado.nombre} width={28} height={28} className="object-contain" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Método de pago</p>
                  <p className="font-bold text-[#231e1d] text-sm">{metodoSeleccionado.nombre}</p>
                </div>
                <button onClick={() => setPaso('seleccion')} className="ml-auto text-xs text-[#b5854b] font-bold hover:underline">
                  Cambiar
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Al confirmar aceptas los términos de pago. El pedido se procesará una vez verificado el pago.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setPaso('seleccion')} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
                Volver
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} />
                Confirmar pago
              </button>
            </div>
          </>
        )}

        {/* ── PASO 3: Procesando ──────────────────────────────────────── */}
        {paso === 'procesando' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#e4c28a]/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#b5854b]"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-lg">Procesando pago</p>
              <p className="text-sm text-slate-400 mt-1">Por favor espera un momento...</p>
            </div>
          </div>
        )}

        {/* ── PASO 4: Éxito ───────────────────────────────────────────── */}
        {paso === 'exito' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center" style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-xl">¡Pago registrado!</p>
              <p className="text-sm text-slate-400 mt-2">
                Tu pago con{' '}
                <strong className="text-[#b5854b]">{metodoSeleccionado?.nombre}</strong>{' '}
                ha sido registrado y está pendiente de verificación.
              </p>
            </div>
            <div className="w-full mt-2 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Pedido</span>
                <span className="font-bold text-[#b5854b]">#{pedido.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monto</span>
                <span className="font-black text-[#231e1d]">{pedido.moneda ?? 'PEN'} {total}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all"
            >
              Listo
            </button>
          </div>
        )}

        {/* ── PASO 5: Error ───────────────────────────────────────────── */}
        {paso === 'error' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <AlertCircle size={36} className="text-rose-500" />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-xl">Error al procesar</p>
              <p className="text-sm text-slate-400 mt-2">
                No se pudo procesar el pago. Por favor intenta nuevamente.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setPaso('seleccion')} className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all">
                Reintentar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────

function PedidoCard({
  pedido,
  index,
  onVerDetalle,
  onPagar,
}: {
  pedido: Pedido;
  index: number;
  onVerDetalle: (p: Pedido) => void;
  onPagar: (p: Pedido) => void;
}) {
  const estado = ESTADO_META[pedido.estado] ?? ESTADO_META.pendiente;
  const pago   = PAGO_META[pedido.estado_pago] ?? PAGO_META.pendiente;
  const Icon   = estado.icon;
  const isPending = pedido.estado_pago === 'pendiente';

  const fecha = new Date(pedido.created_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const total = Number(pedido.total ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-4 md:p-5 rounded-2xl border bg-white',
        'transition-all duration-200 hover:-translate-y-0.5',
        'hover:shadow-lg hover:shadow-[#b5854b]/8 hover:border-[#e4c28a]/50',
        'border-[#e4c28a]/20',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icono */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          'border transition-all duration-300',
          estado.bg, estado.border,
          'group-hover:scale-105',
        )}
      >
        <Icon size={16} className={estado.text} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-[#231e1d]">
          Pedido <span className="text-[#b5854b]">#{pedido.id}</span>
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Calendar size={10} className="text-[#b5854b]/40 flex-shrink-0" />
          <span className="text-[10px] font-medium text-[#231e1d]/35 truncate">{fecha}</span>
          {pedido.total_unidades > 0 && (
            <span className="text-[10px] font-medium text-[#231e1d]/25">
              · {pedido.total_unidades.toLocaleString()} und
            </span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="hidden sm:flex flex-col items-end flex-shrink-0">
        <p className="text-[9px] font-bold text-[#b5854b]/40 uppercase tracking-widest mb-0.5">{pedido.moneda ?? 'PEN'}</p>
        <p className="text-base font-black text-[#231e1d] tabular-nums">{total}</p>
      </div>

      {/* Estado badge */}
      <div className="hidden md:block flex-shrink-0">
        <EstadoBadge estado={pedido.estado} tipo="pedido" />
      </div>

      {/* Pago pill */}
      <div
        className={cn(
          'hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0',
          'border',
          pago.bg,
        )}
        style={{ borderColor: `${pago.dot}30` }}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', pago.dot)} />
        <span className={cn('text-[10px] font-bold', pago.text)}>{pago.label}</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Botón Pagar — visible solo si pago pendiente */}
        {isPending && (
          <button
            onClick={(e) => { e.stopPropagation(); onPagar(pedido); }}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl',
              'bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a]',
              'text-[10px] font-black uppercase tracking-wide',
              'transition-all duration-200 hover:scale-105',
            )}
          >
            <CreditCard size={11} />
            Pagar
          </button>
        )}

        {/* Botón Detalle */}
        <button
          onClick={() => onVerDetalle(pedido)}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            'bg-[#e4c28a]/15 text-[#b5854b]/40',
            'group-hover:bg-[#231e1d] group-hover:text-[#e4c28a]',
            'transition-all duration-200',
          )}
        >
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Animaciones globales ─────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);     }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1);   }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ─── Página principal ──────────────────────────────────────────────────────────

export default function MisPedidosPage() {
  const { cliente, loading: authLoading } = usePortal();
  const [pedidos, setPedidos]             = useState<Pedido[]>([]);
  const [cotizaciones, setCotizaciones]   = useState<CotizacionHistorial[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [pedidoPago, setPedidoPago]       = useState<Pedido | null>(null);

  const fetchPedidos = useCallback(async () => {
    if (!cliente?.id) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error: err } = await supabase
        .from('pedidos')
        .select('id, total, estado, created_at, total_unidades, moneda')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const ids = (data ?? []).map((p: any) => p.id);
      const pagosMap: Record<number, EstadoPago> = {};

      if (ids.length > 0) {
        const { data: pagos } = await supabase
          .from('pagos')
          .select('pedido_id, estado')
          .in('pedido_id', ids)
          .order('created_at', { ascending: false });

        (pagos ?? []).forEach((p: any) => {
          if (!pagosMap[p.pedido_id]) {
            pagosMap[p.pedido_id] = p.estado as EstadoPago;
          }
        });
      }

      setPedidos(
        (data ?? []).map((p: any) => ({
          id:             p.id,
          total:          p.total          ?? 0,
          estado:         p.estado         ?? 'pendiente',
          estado_pago:    pagosMap[p.id]   ?? 'pendiente',
          created_at:     p.created_at     ?? new Date().toISOString(),
          total_unidades: p.total_unidades ?? 0,
          moneda:         p.moneda         ?? 'PEN',
        })),
      );

      const { data: cotizacionesData, error: cotErr } = await supabase
        .from('cotizaciones')
        .select('id, numero, total, costo_envio, estado, created_at, valida_hasta')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (cotErr) throw cotErr;

      setCotizaciones(
        (cotizacionesData ?? []).map((c: any) => ({
          id: c.id,
          numero: c.numero ?? `COT-${c.id}`,
          total: Number(c.total ?? 0),
          costo_envio: Number(c.costo_envio ?? 0),
          estado: c.estado ?? 'borrador',
          created_at: c.created_at ?? new Date().toISOString(),
          valida_hasta: c.valida_hasta ?? new Date().toISOString(),
        })),
      );
    } catch (e: unknown) {
      setError('No se pudieron cargar los pedidos.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cliente]);

  useEffect(() => {
    if (!authLoading) fetchPedidos();
  }, [cliente, authLoading, fetchPedidos]);

  const stats = {
    total:      pedidos.length,
    activos:    pedidos.filter(p => ['pendiente', 'en_produccion'].includes(p.estado)).length,
    listos:     pedidos.filter(p => p.estado === 'listo_para_despacho').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
  };

  const cotizacionesRecientes = cotizaciones.slice(0, 3);

  const handlePagar = (pedido: Pedido) => {
    setPedidoDetalle(null);
    setPedidoPago(pedido);
  };

  return (
    <>
      {/* Inyectar animaciones */}
      <style>{GLOBAL_STYLES}</style>

      <div className="min-h-screen bg-[#fff4e2] p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-7">

          {/* ── Cabecera ────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#231e1d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#231e1d]/20">
                <ShoppingBag size={20} className="text-[#e4c28a]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#b5854b] uppercase tracking-[0.22em] mb-0.5">Portal de cliente</p>
                <h1 className="text-3xl md:text-4xl font-black text-[#231e1d] leading-none tracking-tight">Mis Pedidos</h1>
              </div>
            </div>

            {!loading && !error && (
              <button
                onClick={fetchPedidos}
                className={cn(
                  'self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'border border-[#e4c28a]/40 bg-white text-[#b5854b]',
                  'text-[11px] font-bold transition-all duration-200',
                  'hover:border-[#b5854b]/40 hover:bg-[#e4c28a]/10',
                )}
              >
                <RefreshCw size={12} />
                Actualizar
              </button>
            )}
          </div>

          {/* ── KPIs ──────────────────────────────────────────────────────── */}
          {!loading && !error && pedidos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total"      value={stats.total}      accent="#b5854b" />
              <KpiCard label="Activos"    value={stats.activos}    accent="#3b82f6" />
              <KpiCard label="Listos"     value={stats.listos}     accent="#10b981" />
              <KpiCard label="Entregados" value={stats.entregados} accent="#14b8a6" />
            </div>
          )}

          {/* ── Aviso pagos pendientes ─────────────────────────────────────── */}
          {!loading && !error && pedidos.some(p => p.estado_pago === 'pendiente') && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CreditCard size={14} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-700">
                  Tienes {pedidos.filter(p => p.estado_pago === 'pendiente').length} pago(s) pendiente(s)
                </p>
                <p className="text-[10px] text-amber-500 mt-0.5">
                  Usa el botón <strong>Pagar</strong> en cada pedido para completar tu pago.
                </p>
              </div>
            </div>
          )}

          {/* ── Historial de cotizaciones ───────────────────────────────── */}
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
                  <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="p-3">
                {cotizacionesRecientes.length > 0 ? (
                  <div className="space-y-2">
                    {cotizacionesRecientes.map((cot) => (
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
                            <p className="text-sm font-black text-[#231e1d] truncate">{cot.numero}</p>
                            <p className="text-[10px] font-medium text-[#231e1d]/35 truncate">
                              {new Date(cot.created_at).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })} · Envío {formatCurrency(cot.costo_envio)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-[#b5854b]/40 uppercase tracking-widest">Total</p>
                            <p className="text-sm font-black text-[#231e1d] tabular-nums">{formatCurrency(cot.total)}</p>
                          </div>
                          <EstadoBadge estado={cot.estado} tipo="cotizacion" />
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

          {/* ── Lista / estados ──────────────────────────────────────────── */}
          {loading || authLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <PedidoSkeleton key={i} />)}
            </div>

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e4c28a]/15 flex items-center justify-center">
                <XCircle size={20} className="text-[#b5854b]/50" />
              </div>
              <p className="text-xs font-bold text-[#231e1d]/40">{error}</p>
              <button
                onClick={fetchPedidos}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#231e1d] text-[#e4c28a] text-xs font-bold hover:bg-[#b5854b] hover:text-[#fff4e2] transition-all duration-200"
              >
                <RefreshCw size={12} />
                Reintentar
              </button>
            </div>

          ) : pedidos.length === 0 ? (
            <div className={cn(
              'flex flex-col items-center justify-center py-24 gap-5',
              'rounded-3xl border-2 border-dashed border-[#e4c28a]/40 bg-white/50',
            )}>
              <div className="w-16 h-16 rounded-3xl bg-[#e4c28a]/15 flex items-center justify-center">
                <PackageSearch size={26} className="text-[#b5854b]/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-[#231e1d]/30">Sin pedidos registrados</p>
                <p className="text-[11px] text-[#231e1d]/20 font-medium mt-1">Cuando realices un pedido aparecerá aquí</p>
              </div>
              <Link
                href="/portal/cotizaciones/nueva"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#231e1d] text-[#e4c28a] text-xs font-black hover:bg-[#b5854b] hover:text-[#fff4e2] transition-all duration-200"
              >
                <Plus size={13} />
                Crear cotización
              </Link>
            </div>

          ) : (
            <div className="space-y-2.5">
              {pedidos.map((pedido, i) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  index={i}
                  onVerDetalle={setPedidoDetalle}
                  onPagar={handlePagar}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────────── */}
      {pedidoDetalle && !pedidoPago && (
        <ModalDetalle
          pedido={pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
          onPagar={() => handlePagar(pedidoDetalle)}
        />
      )}

      {pedidoPago && (
        <ModalPago
          pedido={pedidoPago}
          onClose={() => setPedidoPago(null)}
        />
      )}
    </>
  );
}
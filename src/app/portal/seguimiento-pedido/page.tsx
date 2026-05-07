'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck, Factory, ShieldCheck, Truck,
  CheckCircle2, Clock3, CircleHelp, MessageCircle,
  Mail, Loader2, AlertCircle, RefreshCw, Package,
  CalendarDays, ChevronRight, User,
} from 'lucide-react';
import {
  getPedidosActivos,
  subscribeSeguimiento,
  type PedidoConSeguimiento,
  type EstadoPedido,
  type SeguimientoPedido,
} from '@/lib/services/seguimiento-pedido-services';

// ─── Config visual de etapas ──────────────────────────────────────────────────

type EtapaConfig = {
  id:       EstadoPedido;
  icon:     React.ElementType;
  title:    string;
  detail:   string;
  etaLabel: string;
  eta:      string;
};

const ETAPAS: EtapaConfig[] = [
  {
    id:       'pendiente',
    icon:     ClipboardCheck,
    title:    'Orden confirmada',
    detail:   'Registramos tu orden mayorista y validamos cantidades, tallas y datos de entrega. Recibirás un correo de confirmación con el resumen completo.',
    etaLabel: 'Tiempo de validación',
    eta:      '24 horas',
  },
  {
    id:       'en_produccion',
    icon:     Factory,
    title:    'En producción',
    detail:   'Tu pedido ingresa a confección y control interno de calidad por lote. El tiempo varía según el volumen y la programación del taller.',
    etaLabel: 'Duración estimada',
    eta:      'Según programación',
  },
  {
    id:       'listo_para_despacho',
    icon:     ShieldCheck,
    title:    'Listo para despacho',
    detail:   'Verificamos acabados, tallaje y empaque para asegurar estándar comercial. Ningún lote sale sin pasar esta revisión.',
    etaLabel: 'Tiempo de revisión',
    eta:      '1 a 2 días',
  },
  {
    id:       'entregado',
    icon:     Truck,
    title:    'Despachado',
    detail:   'Coordinamos envío con operador logístico y compartimos datos de salida. Recibirás el número de guía para rastreo.',
    etaLabel: 'Cobertura',
    eta:      'Entrega nacional',
  },
];

const ESTADO_INDICE: Partial<Record<EstadoPedido, number>> = {
  pendiente:            0,
  en_produccion:        1,
  listo_para_despacho:  2,
  entregado:            3,
};

const ESTADO_COLOR: Record<EstadoPedido, { text: string; bg: string; border: string; dot: string }> = {
  pendiente:            { text: '#8A7676', bg: '#F5EBEB', border: '#E7D7D7', dot: '#C9B8B8' },
  en_produccion:        { text: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  listo_para_despacho:  { text: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6' },
  entregado:            { text: '#1D7A4A', bg: '#E8F5EE', border: '#52B07A', dot: '#22C55E' },
  cancelado:            { text: '#A32D2D', bg: '#FCEBEB', border: '#E24B4A', dot: '#EF4444' },
};

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente:            'Pendiente',
  en_produccion:        'En producción',
  listo_para_despacho:  'Listo p/ despacho',
  entregado:            'Entregado',
  cancelado:            'Cancelado',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatRelativo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'Hace un momento';
  if (min < 60)  return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d} día${d > 1 ? 's' : ''}`;
}

// ─── Badge estado ─────────────────────────────────────────────────────────────

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const c = ESTADO_COLOR[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {ESTADO_LABEL[estado]}
    </span>
  );
}

// ─── Timeline horizontal (desktop) ───────────────────────────────────────────

function TimelineDesktop({ estadoActual }: { estadoActual: EstadoPedido }) {
  const idx = ESTADO_INDICE[estadoActual] ?? 0;
  const pct = ETAPAS.length > 1 ? (idx / (ETAPAS.length - 1)) * 100 : 0;

  return (
    <div className="hidden md:flex items-start relative py-2">
      <div className="absolute top-7 left-0 right-0 h-0.5 bg-[#EDE0E0]" />
      <div
        className="absolute top-7 left-0 h-0.5 bg-gradient-to-r from-[#B8962D] to-[#D4AF37] transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
      {ETAPAS.map((etapa, i) => {
        const Icon      = etapa.icon;
        const completado = i < idx;
        const activo    = i === idx;

        return (
          <div key={etapa.id} className="flex-1 flex flex-col items-center relative">
            <div
              className={[
                'w-14 h-14 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-300',
                completado
                  ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.4)]'
                  : activo
                  ? 'bg-white border-[#D4AF37] shadow-[0_0_0_4px_rgba(212,175,55,0.12),0_4px_12px_rgba(74,55,55,0.1)]'
                  : 'bg-white border-[#EDE0E0]',
              ].join(' ')}
            >
              {completado
                ? <CheckCircle2 className="w-6 h-6 text-white" />
                : <Icon className={`w-5 h-5 ${activo ? 'text-[#B8962D]' : 'text-[#C9B8B8]'}`} />
              }
            </div>

            <div className="mt-3 text-center px-2 max-w-[120px]">
              <p className={`text-xs font-bold leading-tight ${completado || activo ? 'text-[#3A2A2A]' : 'text-[#C9B8B8]'}`}>
                {etapa.title}
              </p>
              <p className="text-[10px] text-[#9A8080] mt-1 uppercase tracking-wider">{etapa.eta}</p>
            </div>

            {activo && (
              <span className="mt-2 text-[10px] uppercase tracking-widest font-bold text-[#B8962D] bg-[#FDF6E3] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full animate-pulse">
                En curso
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline vertical (mobile) ──────────────────────────────────────────────

function TimelineMobile({ estadoActual }: { estadoActual: EstadoPedido }) {
  const idx = ESTADO_INDICE[estadoActual] ?? 0;

  return (
    <div className="md:hidden space-y-0">
      {ETAPAS.map((etapa, i) => {
        const Icon      = etapa.icon;
        const completado = i < idx;
        const activo    = i === idx;
        const ultimo    = i === ETAPAS.length - 1;

        return (
          <div key={etapa.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={[
                'w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0',
                completado ? 'bg-[#D4AF37] border-[#D4AF37]'
                  : activo ? 'bg-white border-[#D4AF37]'
                  : 'bg-white border-[#EDE0E0]',
              ].join(' ')}>
                {completado
                  ? <CheckCircle2 className="w-4 h-4 text-white" />
                  : <Icon className={`w-4 h-4 ${activo ? 'text-[#B8962D]' : 'text-[#C9B8B8]'}`} />
                }
              </div>
              {!ultimo && (
                <div className={`w-px flex-1 mt-1 mb-1 min-h-[1.5rem] ${completado ? 'bg-[#D4AF37]' : 'bg-[#EDE0E0]'}`} />
              )}
            </div>

            <div className="pb-5 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-semibold ${completado || activo ? 'text-[#3A2A2A]' : 'text-[#C9B8B8]'}`}>
                  {etapa.title}
                </p>
                {activo && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#B8962D] bg-[#FDF6E3] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                    En curso
                  </span>
                )}
              </div>
              {(completado || activo) && (
                <p className="text-xs text-[#8A7676] leading-relaxed">{etapa.detail}</p>
              )}
              <p className="text-[10px] text-[#9A8080] mt-1 uppercase tracking-wider">
                {etapa.etaLabel}: {etapa.eta}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Historial de cambios ─────────────────────────────────────────────────────

function HistorialPanel({ historial }: { historial: SeguimientoPedido[] }) {
  if (!historial.length) return null;

  return (
    <div className="px-6 pb-5">
      <p className="text-[11px] uppercase tracking-widest font-semibold text-[#9A8080] mb-3">
        Historial de cambios
      </p>
      <div className="space-y-2">
        {[...historial].reverse().map((h, i) => {
          const c = ESTADO_COLOR[h.status];
          return (
            <div
              key={h.id}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                i === 0 ? 'border-[#D4AF37]/30 bg-[#FDF9F0]' : 'border-transparent bg-[#FAF5F5]'
              }`}
            >
              <span
                className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: c.dot }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: c.text }}
                  >
                    {ESTADO_LABEL[h.status]}
                  </span>
                  {h.notas && (
                    <span className="text-xs text-[#6D5A5A] truncate">— {h.notas}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-[#9A8080]">
                    {formatFecha(h.created_at)}
                  </span>
                  {h.usuarios?.nombre_completo && (
                    <span className="flex items-center gap-1 text-[10px] text-[#9A8080]">
                      <User className="w-2.5 h-2.5" />
                      {h.usuarios.nombre_completo}
                    </span>
                  )}
                </div>
              </div>
              {i === 0 && (
                <span className="text-[10px] text-[#B8962D] font-semibold flex-shrink-0">
                  Último
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Card de pedido ───────────────────────────────────────────────────────────

function CardPedido({ pedido, onNuevoEstado }: {
  pedido: PedidoConSeguimiento;
  onNuevoEstado: (pedidoId: number, nuevo: SeguimientoPedido) => void;
}) {
  const [verHistorial, setVerHistorial] = useState(false);
  const etapaActual = ETAPAS.find((e) => e.id === pedido.estado);
  const Icon        = etapaActual?.icon ?? Package;

  // Suscripción realtime por pedido
  useEffect(() => {
  const unsub = subscribeSeguimiento(pedido.id, (row) => {
    onNuevoEstado(pedido.id, row);
  });

  return () => {
    void unsub();
  };
}, [pedido.id, onNuevoEstado]);

  return (
    <article className="bg-white border border-[#E7D7D7] rounded-2xl shadow-[0_4px_24px_rgba(74,55,55,0.07)] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[#F0E4E4] bg-gradient-to-r from-white to-[#FAF5F5]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#F5EBEB] border border-[#E7D7D7]">
              <Icon className="w-5 h-5 text-[#B8962D]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-xs font-bold text-[#B8962D] bg-[#FDF6E3] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {pedido.codigo}
                </span>
                <BadgeEstado estado={pedido.estado} />
              </div>
              <h2 className="text-base font-bold text-[#3A2A2A]">{pedido.cliente}</h2>
              <p className="text-xs text-[#8A7676] mt-0.5 flex items-center gap-1">
                <Clock3 className="w-3 h-3" />
                Actualizado {formatRelativo(pedido.ultimaActualizacion)}
              </p>
            </div>
          </div>

          <div className="flex gap-5 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9A8080] mb-0.5 flex items-center justify-end gap-1">
                <Package className="w-3 h-3" /> Unidades
              </p>
              <p className="text-lg font-bold text-[#4A3737]">
                {pedido.total_unidades.toLocaleString('es-PE')}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9A8080] mb-0.5 flex items-center justify-end gap-1">
                <CalendarDays className="w-3 h-3" /> Entrega est.
              </p>
              <p className="text-sm font-bold text-[#4A3737]">
                {formatFecha(pedido.fecha_entrega_est)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9A8080] mb-0.5 flex items-center justify-end gap-1">
                <CalendarDays className="w-3 h-3" /> Orden
              </p>
              <p className="text-sm font-bold text-[#4A3737]">
                {formatFecha(pedido.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4">
        <TimelineDesktop estadoActual={pedido.estado} />
        <TimelineMobile  estadoActual={pedido.estado} />
      </div>

      {/* ── Detalle etapa actual ─────────────────────────────────────────────── */}
      {etapaActual && (
        <div className="mx-6 mb-4 p-4 bg-[#FDF9F0] border border-[#D4AF37]/20 rounded-xl">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-[#B8962D]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#3A2A2A] mb-0.5">{etapaActual.title}</p>
              <p className="text-xs text-[#6D5A5A] leading-relaxed">{etapaActual.detail}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Nota del cliente ─────────────────────────────────────────────────── */}
      {pedido.notas_cliente && (
        <div className="mx-6 mb-4 p-3 bg-[#F5EBEB] border border-[#EAD7D7] rounded-xl">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#9A8080] mb-1">
            Nota de orden
          </p>
          <p className="text-xs text-[#6D5A5A] leading-relaxed">{pedido.notas_cliente}</p>
        </div>
      )}

      {/* ── Historial ────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-2">
        <button
          onClick={() => setVerHistorial((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8A7676] hover:text-[#B8962D] transition-colors mb-2"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform ${verHistorial ? 'rotate-90' : ''}`}
          />
          {verHistorial ? 'Ocultar historial' : `Ver historial (${pedido.historial.length})`}
        </button>
      </div>
      {verHistorial && <HistorialPanel historial={pedido.historial} />}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 bg-[#FAF5F5] border-t border-[#F0E4E4] flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-[#9A8080] italic">
          * Tiempos estimados sujetos a programación del taller.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://wa.me/51908801912"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#B8962D] text-white text-xs uppercase tracking-widest font-bold transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          {pedido.email && (
            <a
              href={`mailto:${pedido.email}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/40 text-[#4A3737] hover:border-[#B8962D] hover:text-[#B8962D] text-xs uppercase tracking-widest font-bold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Correo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SeguimientoPedidoPage() {
  const [pedidos,  setPedidos]  = useState<PedidoConSeguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getPedidosActivos();
      setPedidos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Cuando llega un nuevo estado por Realtime, lo agrega al historial
  const handleNuevoEstado = useCallback(
    (pedidoId: number, nuevo: SeguimientoPedido) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id !== pedidoId
            ? p
            : {
                ...p,
                estado:              nuevo.status,
                historial:           [...p.historial, nuevo],
                ultimaActualizacion: nuevo.created_at,
              },
        ),
      );
    },
    [],
  );

  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">
            Portal B2B · Atención VIP
          </p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">
            Seguimiento de{' '}
            <span className="text-[#B8962D] italic">Pedidos</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[#6D5A5A] leading-relaxed">
            Monitorea en tiempo real el estado de tu orden mayorista a través de
            cada etapa del proceso. Los cambios de estado se reflejan automáticamente.
          </p>
        </div>
      </section>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Encabezado lista */}
        {!cargando && !error && (
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#4A3737] uppercase tracking-widest">
              Pedidos activos
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8A7676]">
                {pedidos.length} orden{pedidos.length !== 1 ? 'es' : ''} en proceso
              </span>
              <button
                onClick={cargar}
                className="p-1.5 rounded-lg hover:bg-[#F0E4E4] transition-colors"
                aria-label="Refrescar"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#8A7676]" />
              </button>
            </div>
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 text-[#D4AF37] animate-spin" />
            <p className="text-sm text-[#8A7676]">Cargando pedidos…</p>
          </div>
        )}

        {/* Error */}
        {!cargando && error && (
          <div className="flex items-start gap-3 bg-[#FCEBEB] border border-[#F09595] rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-[#A32D2D] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#A32D2D]">
                Error al cargar pedidos
              </p>
              <p className="text-xs text-[#993C1D] mt-0.5">{error}</p>
            </div>
            <button
              onClick={cargar}
              className="text-xs font-bold text-[#A32D2D] hover:text-[#7A1F1F] uppercase tracking-wider transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!cargando && !error && pedidos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Package className="w-10 h-10 text-[#D4AF37]/40" />
            <p className="text-sm font-semibold text-[#4A3737]">Sin pedidos activos</p>
            <p className="text-xs text-[#8A7676]">
              No hay órdenes en proceso en este momento.
            </p>
          </div>
        )}

        {/* Lista */}
        {!cargando && !error && pedidos.map((p) => (
          <CardPedido
            key={p.id}
            pedido={p}
            onNuevoEstado={handleNuevoEstado}
          />
        ))}

        {/* Nota de ayuda */}
        {!cargando && !error && pedidos.length > 0 && (
          <section className="bg-[#F5EBEB] border border-[#EAD7D7] rounded-2xl p-5 md:p-6">
            <div className="flex items-start gap-3">
              <CircleHelp className="w-4 h-4 text-[#B8962D] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#6D5A5A] leading-relaxed">
                Para una consulta puntual, incluye en tu mensaje el código de orden,
                nombre del cliente y modelo solicitado para una respuesta más rápida.
              </p>
            </div>
            <Link
              href="/ecommerce/preguntas-frecuentes"
              className="inline-block mt-4 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:text-[#B8962D] transition-colors"
            >
              Ver preguntas frecuentes →
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
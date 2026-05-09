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
import { usePortal } from '../_contexts/PortalContext';

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
  const { cliente } = usePortal();
  const [pedidos,  setPedidos]  = useState<PedidoConSeguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!cliente?.id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await getPedidosActivos(cliente.id);
      setPedidos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, [cliente?.id]);

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
    <div className="space-y-10 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-xs uppercase tracking-[0.2em]">
            <div className="w-8 h-px bg-[#d4af37]/40" />
            <span>Atención Prioritaria B2B</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Trazabilidad de <span className="text-[#d4af37]">Órdenes</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
            Gestione y monitorea el ciclo de vida de sus pedidos mayoristas en tiempo real.
          </p>
        </div>
        
        {!cargando && !error && (
          <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col text-right pr-2 border-r border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ordenes</span>
              <span className="text-lg font-bold text-slate-900">{pedidos.length}</span>
            </div>
            <button
              onClick={cargar}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all hover:rotate-180 duration-500"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="grid grid-cols-1 gap-10">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Sincronizando sus pedidos...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-rose-900">Error de conexión</h3>
              <p className="text-rose-600/80">{error}</p>
            </div>
            <button
              onClick={cargar}
              className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 flex flex-col items-center text-center gap-6 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Package size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Sin pedidos activos</h3>
              <p className="text-slate-500 max-w-sm">No tiene órdenes en proceso en este momento. Puede revisar su historial en la sección de facturación.</p>
            </div>
            <Link
              href="/portal/productos"
              className="px-10 py-4 bg-[#d4af37] text-white rounded-2xl font-bold hover:bg-[#b8962d] transition-all shadow-xl shadow-[#d4af37]/20"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          pedidos.map((p) => (
            <CardPedido key={p.id} pedido={p} onNuevoEstado={handleNuevoEstado} />
          ))
        )}

        {/* ── Ayuda ── */}
        {!cargando && !error && pedidos.length > 0 && (
          <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-slate-900/20">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#d4af37]">
                    <CircleHelp size={20} />
                  </div>
                  <h3 className="text-2xl font-bold">¿Necesita asistencia técnica?</h3>
                </div>
                <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                  Nuestro equipo comercial está disponible para resolver dudas sobre tiempos de entrega o especificaciones técnicas de su lote.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <a
                  href="https://wa.me/51908801912"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle size={18} />
                  WhatsApp VIP
                </a>
                <Link
                  href="/ecommerce/preguntas-frecuentes"
                  className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  Soporte
                </Link>
              </div>
            </div>
            {/* Decoración fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -ml-32 -mb-32" />
          </section>
        )}
      </div>
    </div>
  );
}
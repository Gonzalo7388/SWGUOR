'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardCheck, Factory, ShieldCheck, Truck,
  CheckCircle2, Package, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  getPedidosActivos,
  type PedidoConSeguimiento,
  type EstadoPedido,
} from '@/lib/services/seguimiento-pedido.service';
import { usePortal } from '../_contexts/PortalContext';

// ─── Config de Etapas ─────────────────────────────────────────────────────────

type EtapaConfig = {
  id: EstadoPedido;
  icon: React.ElementType;
  label: string;
};

const ETAPAS: EtapaConfig[] = [
  { id: 'pendiente', icon: ClipboardCheck, label: 'Confirmado' },
  { id: 'en_produccion', icon: Factory, label: 'En Confección' },
  { id: 'listo_para_despacho', icon: ShieldCheck, label: 'Control Calidad' },
  { id: 'entregado', icon: Truck, label: 'Despachado' },
];

const ESTADO_INDICE: Partial<Record<EstadoPedido, number>> = {
  pendiente: 0,
  en_produccion: 1,
  listo_para_despacho: 2,
  entregado: 3,
};

// ─── Componentes ──────────────────────────────────────────────────────────────

function TimelineSimple({ estadoActual }: { estadoActual: EstadoPedido }) {
  const currentIdx = ESTADO_INDICE[estadoActual] ?? 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
      {/* Línea de fondo */}
      <div className="absolute top-[3.75rem] left-10 right-10 h-0.5 bg-slate-100 hidden md:block" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-0">
        {ETAPAS.map((etapa, index) => {
          const Icon = etapa.icon;
          const isCompleted = index < currentIdx;
          const isActive = index === currentIdx;

          return (
            <div key={etapa.id} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative z-10">
              {/* Círculo / Icono */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted
                  ? 'bg-[#d4af37] border-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20'
                  : isActive
                    ? 'bg-white border-[#d4af37] text-[#d4af37] ring-4 ring-[#d4af37]/10'
                    : 'bg-white border-slate-200 text-slate-300'
                  }`}
              >
                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={20} />}
              </div>

              {/* Etiqueta */}
              <div className="flex flex-col md:items-center">
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}
                >
                  {etapa.label}
                </span>
                {isActive && (
                  <span className="text-[10px] text-[#d4af37] font-black uppercase tracking-tighter animate-pulse">
                    En curso
                  </span>
                )}
              </div>

              {/* Línea vertical para mobile */}
              {index < ETAPAS.length - 1 && (
                <div className="absolute top-12 left-6 w-0.5 h-8 bg-slate-100 md:hidden" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SeguimientoPedidoPage() {
  const { cliente } = usePortal();
  const [pedidos, setPedidos] = useState<PedidoConSeguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!cliente?.id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await getPedidosActivos(cliente.id);
      setPedidos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  }, [cliente?.id]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header Minimalista */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          Seguimiento de <span className="text-[#d4af37]">Pedidos</span>
        </h1>
        <p className="text-slate-500 font-medium">Monitoreo en tiempo real de su producción</p>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-8">
        {cargando ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="animate-spin text-[#d4af37]" size={32} />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
            <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
            <p className="text-red-600 font-bold">{error}</p>
            <button onClick={cargar} className="mt-4 text-xs font-black uppercase text-red-400 hover:underline">Reintentar</button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white border border-slate-100 p-20 rounded-[3rem] text-center shadow-sm">
            <Package className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No tiene pedidos activos</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black text-[#d4af37] bg-[#d4af37]/5 px-3 py-1 rounded-full uppercase tracking-widest border border-[#d4af37]/20">
                    {pedido.codigo}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">{pedido.cliente}</h3>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidades</p>
                    <p className="text-lg font-black text-slate-900">{pedido.total_unidades}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Pedido</p>
                    <p className="text-lg font-black text-slate-900">
                      {new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* La Línea de Tiempo es lo principal */}
              <div className="bg-slate-50/30">
                <TimelineSimple estadoActual={pedido.estado} />
              </div>

              <div className="px-8 py-4 bg-white flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Estado: <span className="text-slate-900">{pedido.estado.replace('_', ' ')}</span></p>
                <a
                  href={`https://wa.me/51908801912?text=Hola, quisiera consultar sobre mi pedido ${pedido.codigo}`}
                  target="_blank"
                  className="text-[10px] font-black uppercase text-[#d4af37] hover:underline"
                >
                  Consultar con asesor
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
/**
 * TabSeguimiento.tsx
 * Tab de seguimiento: barra de progreso de estado + timeline de eventos.
 * Ubicación: src/components/admin/pedidos/detalles/TabSeguimiento.tsx
 */

'use client';

import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { SectionCard } from './PedidoDetalleUI';
import {
  ESTADO_CONFIG,
  ETAPAS_PROGRESO,
  fmtDate,
  type DetallePedidoData,
} from './types';
import { COMPANY_PALETTE } from '@/components/admin/dashboards/widgets/DashboardUtils';

const G = COMPANY_PALETTE;

interface TabSeguimientoProps {
  pedido: DetallePedidoData;
}

// ── Barra de progreso de estado ───────────────────────────────────────────────

function BarraProgreso({ estadoActual }: { estadoActual: string }) {
  const idxActual = ETAPAS_PROGRESO.indexOf(
    estadoActual as typeof ETAPAS_PROGRESO[number]
  );
  const pct = idxActual < 0
    ? 0
    : (idxActual / (ETAPAS_PROGRESO.length - 1)) * 100;

  return (
    <div className="relative flex items-center justify-between">
      {/* Línea de fondo */}
      <div className="absolute left-0 right-0 top-4 h-0.5 bg-stone-100 z-0" />
      {/* Línea de progreso */}
      <div
        className="absolute left-0 top-4 h-0.5 z-0 transition-all duration-700"
        style={{ background: G.accent, width: `${pct}%` }}
      />

      {ETAPAS_PROGRESO.map((etapa, i) => {
        const cfg    = ESTADO_CONFIG[etapa];
        const Icon   = cfg?.icon ?? Clock;
        const pasado = i <= idxActual;
        const actual = i === idxActual;

        return (
          <div key={etapa} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              actual  ? 'border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-200' :
              pasado  ? 'border-rose-600 bg-white text-rose-600' :
                        'border-stone-200 bg-white text-stone-300'
            }`}>
              <Icon size={13} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter text-center max-w-[60px] leading-tight hidden sm:block ${
              pasado ? 'text-stone-700' : 'text-stone-300'
            }`}>
              {cfg?.label ?? etapa}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Timeline de eventos ───────────────────────────────────────────────────────

function TimelineEventos({ pedido }: { pedido: DetallePedidoData }) {
  const seguimientos = pedido.seguimiento_pedido ?? [];

  if (seguimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Clock size={28} className="text-stone-200" />
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
          Sin eventos registrados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {seguimientos.map((s, i) => {
        const cfg      = ESTADO_CONFIG[s.estado];
        const Icon     = cfg?.icon ?? Clock;
        const esUltimo = i === seguimientos.length - 1;

        return (
          <div key={s.id} className="relative flex gap-4">
            {/* Línea vertical conectora */}
            {!esUltimo && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-stone-100" />
            )}

            {/* Dot */}
            <div className={`relative z-10 mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
              cfg?.color ?? 'bg-stone-50 text-stone-400 border-stone-200'
            }`}>
              <Icon size={13} />
            </div>

            {/* Contenido */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-black text-stone-900">
                  {cfg?.label ?? s.estado}
                </span>
                <span className="text-[10px] text-stone-400 font-bold">
                  {fmtDate(s.created_at)}
                </span>
              </div>
              {s.notas && (
                <p className="text-xs text-stone-500 leading-relaxed bg-stone-50 rounded-xl px-3 py-2 border border-stone-100">
                  {s.notas}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function TabSeguimiento({ pedido }: TabSeguimientoProps) {
  return (
    <div className="space-y-5">

      <SectionCard title="Estado del Pedido">
        <BarraProgreso estadoActual={pedido.estado} />
      </SectionCard>

      <SectionCard title="Historial de Cambios">
        <TimelineEventos pedido={pedido} />
      </SectionCard>

      {pedido.direccion_despacho && (
        <SectionCard title="Dirección de Despacho">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-stone-700 font-medium">{pedido.direccion_despacho}</p>
          </div>
        </SectionCard>
      )}

    </div>
  );
}
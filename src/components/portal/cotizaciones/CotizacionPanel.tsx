'use client';

import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { usePortal, MOQ_MINIMO, type ZonaEnvio } from '@/app/portal/_contexts/PortalContext';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';

const PORTAL_OCRE = '#b5854b';
const PORTAL_OCRE_DARK = '#9a6e3a';
const PORTAL_CREAM = '#fff4e2';

interface Props {
  onEnviar: (accion: 'borrador' | 'enviar') => void;
  isSending: boolean;
}

// ── Sub-componente: fila de un ítem (solo lectura) ──────────────────────────
function ItemResumen({ item }: { item: ReturnType<typeof usePortal>['items'][number] }) {
  const { eliminarDelBorrador } = usePortal();
  const moqOk = item.cantidad >= MOQ_MINIMO;

  return (
    <article
      className={cn(
        'border rounded-md p-3 space-y-1.5 transition-colors',
        moqOk ? 'border-slate-100 hover:border-slate-200' : 'border-amber-200 bg-amber-50/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-900 truncate">{item.nombre}</p>
          <p className="text-[11px] text-slate-400">{item.talla} · {item.color}</p>
        </div>
        <button
          onClick={() => eliminarDelBorrador(item.variante_id)}
          aria-label={`Eliminar ${item.nombre}`}
          className="text-slate-300 hover:text-red-500 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Cant.</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 tabular-nums">
            {item.cantidad.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">uds</span>
        </div>
        <span className="text-xs font-bold text-slate-900 tabular-nums">
          {formatCurrency(item.subtotal)}
        </span>
      </div>

      {!moqOk && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-700" role="alert">
          <AlertTriangle size={12} aria-hidden="true" />
          Mínimo {MOQ_MINIMO.toLocaleString()} uds — ajusta la cantidad en la tabla
        </div>
      )}
    </article>
  );
}

// ── Sub-componente: selector de zona de envío ───────────────────────────────
// ← CAMBIADO: usa costosEnvio de la BD en lugar de ZONAS_ENVIO hardcodeado
function SelectorZonaEnvio() {
  const { zonaEnvio, actualizarZonaEnvio, resumen, costosEnvio } = usePortal();

  // Zona actualmente seleccionada
  const zonaActual = costosEnvio.find(c => c.zona === zonaEnvio);

  return (
    <div
      className="rounded-xl border p-3 space-y-2"
      style={{ backgroundColor: PORTAL_CREAM, borderColor: PORTAL_OCRE_DARK }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: PORTAL_OCRE }}>
            Envío
          </p>
          <p className="text-xs" style={{ color: PORTAL_OCRE_DARK }}>
            {zonaActual?.zona ?? zonaEnvio}
          </p>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: PORTAL_OCRE_DARK }}>
          {formatCurrency(resumen.costo_envio)}
        </span>
      </div>

      <label
        htmlFor="zona-envio-select"
        className="text-[10px] font-black uppercase tracking-widest block"
        style={{ color: PORTAL_OCRE }}
      >
        Zona de envío
      </label>

      {/* ← CAMBIADO: opciones generadas dinámicamente desde la BD */}
      <select
        id="zona-envio-select"
        value={zonaEnvio}
        onChange={e => actualizarZonaEnvio(e.target.value as ZonaEnvio)}
        className="w-full h-9 rounded-md border px-3 text-xs focus:outline-none focus:ring-2"
        style={{ backgroundColor: 'white', color: PORTAL_OCRE_DARK, borderColor: PORTAL_OCRE }}
        disabled={costosEnvio.length === 0}
      >
        {costosEnvio.length === 0 ? (
          <option>Cargando zonas...</option>
        ) : (
          costosEnvio.map(c => (
            <option key={c.id} value={c.zona}>
              {c.zona} — S/ {Number(c.costo).toFixed(2)}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

// ── Sub-componente: resumen financiero ──────────────────────────────────────
function ResumenFinanciero() {
  const { resumen } = usePortal();

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Subtotal ({resumen.total_unidades.toLocaleString()} uds)</span>
        <span className="tabular-nums">{formatCurrency(resumen.subtotal)}</span>
      </div>

      {resumen.descuento_pct > 0 && (
        <div className="flex justify-between text-xs text-emerald-700 font-medium">
          <span>Descuento {resumen.descuento_pct}%</span>
          <span className="tabular-nums">− {formatCurrency(resumen.descuento_monto)}</span>
        </div>
      )}

      <div className="flex justify-between text-xs text-slate-500">
        <span>IGV 18%</span>
        <span className="tabular-nums">{formatCurrency(resumen.igv)}</span>
      </div>

      <SelectorZonaEnvio />

      <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
        <span>Total a pagar</span>
        <span className="text-lg tabular-nums" style={{ color: PORTAL_OCRE }}>
          {formatCurrency(resumen.total)}
        </span>
      </div>
    </div>
  );
}

// ── Sub-componente: botones de acción ───────────────────────────────────────
function BotonesAccion({
  onEnviar,
  isSending,
  puedeEnviar,
}: {
  onEnviar: Props['onEnviar'];
  isSending: boolean;
  puedeEnviar: boolean;
}) {
  return (
    <div className="space-y-2 pt-2">
      {/* ← CAMBIADO: "Enviar cotización" → "Generar cotización" */}
      <button
        onClick={() => onEnviar('enviar')}
        disabled={!puedeEnviar || isSending}
        aria-busy={isSending}
        className={cn(
          'w-full py-2.5 rounded-md text-sm font-semibold transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          !isSending && 'hover:brightness-110 active:scale-95',
        )}
        style={{ backgroundColor: PORTAL_OCRE, color: 'white' }}
      >
        {isSending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={15} className="animate-spin" />
            Generando…
          </span>
        ) : (
          'Generar cotización'
        )}
      </button>

      <button
        onClick={() => onEnviar('borrador')}
        disabled={isSending}
        className={cn(
          'w-full py-2.5 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          !isSending && 'hover:bg-slate-50 active:scale-95',
        )}
      >
        Guardar borrador
      </button>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export function CotizadorPanel({ onEnviar, isSending }: Props) {
  const { items, resumen } = usePortal();

  const itemsConMoqError = items.filter(i => i.cantidad < MOQ_MINIMO);
  const puedeEnviar = items.length > 0 && itemsConMoqError.length === 0;

  // ← CAMBIADO: próximo descuento calculado por modelos distintos (items.length)
  // Escalas de la BD: 11→10%, 15→15%, 25→20%, 40→30%
  const ESCALAS_MODELOS = [11, 15, 25, 40];
  const modelosActuales = items.length;
  const proximaEscala = ESCALAS_MODELOS.find(e => modelosActuales < e);
  const modelosFaltantes = proximaEscala ? proximaEscala - modelosActuales : 0;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Encabezado */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-slate-900">Cotización en curso</h2>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Lista de ítems */}
      <div className="flex-1 overflow-auto px-3 py-3 space-y-2">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-slate-400">Sin productos</p>
            <p className="text-xs text-slate-300 mt-1">Agrega productos desde la tabla</p>
          </div>
        )}

        {/* Banner descuento activo */}
        {resumen.descuento_pct > 0 && (
          <div
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-emerald-700 font-medium">{resumen.descripcion_descuento}</p>
          </div>
        )}

        {/* ← CAMBIADO: aviso próximo descuento por modelos distintos */}
        {resumen.descuento_pct === 0 && proximaEscala && modelosFaltantes > 0 && (
          <div
            className="rounded-md px-3 py-2 text-[11px] font-medium"
            style={{ backgroundColor: PORTAL_CREAM, border: `1px solid ${PORTAL_OCRE_DARK}`, color: PORTAL_OCRE }}
          >
            Agrega {modelosFaltantes} modelo{modelosFaltantes > 1 ? 's' : ''} más para desbloquear descuento
          </div>
        )}

        {/* Si ya tiene descuento, mostrar cuánto falta para el siguiente nivel */}
        {resumen.descuento_pct > 0 && proximaEscala && modelosFaltantes > 0 && (
          <div
            className="rounded-md px-3 py-2 text-[11px] font-medium"
            style={{ backgroundColor: PORTAL_CREAM, border: `1px solid ${PORTAL_OCRE_DARK}`, color: PORTAL_OCRE }}
          >
            {modelosFaltantes} modelo{modelosFaltantes > 1 ? 's' : ''} más para el siguiente descuento
          </div>
        )}

        {items.map(item => (
          <ItemResumen key={item.variante_id} item={item} />
        ))}
      </div>

      {/* Footer: resumen + acciones */}
      {items.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-3 space-y-1.5 bg-slate-50">
          <ResumenFinanciero />
          <BotonesAccion
            onEnviar={onEnviar}
            isSending={isSending}
            puedeEnviar={puedeEnviar}
          />
        </div>
      )}
    </div>
  );
}
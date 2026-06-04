"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle2, GitCommitVertical, MessageSquare } from "lucide-react";
import { ESTADO_LABELS } from "@/lib/schemas/confecciones";

export type SeguimientoPayload = {
  confeccion_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  notas?: string;
};

// Keys = valores exactos del enum EstadoConfeccion en la BD
const ESTADO_COLORS: Record<string, { pill: string; dot: string }> = {
  pendiente: { pill: "bg-slate-100   text-slate-700", dot: "bg-slate-400" },
  en_proceso: { pill: "bg-blue-100    text-blue-700", dot: "bg-blue-500" },
  completada: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  rechazada: { pill: "bg-amber-100   text-amber-700", dot: "bg-amber-500" },
  cancelada: { pill: "bg-red-100     text-red-700", dot: "bg-red-500" },
};

// Transiciones válidas según el enum EstadoConfeccion de la BD
const SIGUIENTE_ESTADO: Record<string, string[]> = {
  pendiente: ["en_proceso", "cancelada"],
  en_proceso: ["completada", "rechazada", "cancelada"],
  rechazada: ["pendiente", "cancelada"],
  completada: [],
  cancelada: [],
};

interface Props {
  confeccionId: string;
  seguimientos: any[];
  estadoActual: string;
  puedeActualizar: boolean;
  isLoading?: boolean;
  // onUpdate recibe solo el nuevo estado y las notas —
  // el componente padre llama updateEstado (que hace POST y registra seguimiento)
  onUpdate: (data: SeguimientoPayload) => void;
}

export default function ConfeccionSeguimientoTab({
  confeccionId,
  seguimientos,
  estadoActual,
  puedeActualizar,
  isLoading = false,
  onUpdate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [notas, setNotas] = useState("");

  const siguientes = SIGUIENTE_ESTADO[estadoActual] ?? [];

  const handleSubmit = () => {
    if (!estadoNuevo) return;
    onUpdate({
      confeccion_id: confeccionId,
      estado_anterior: estadoActual,
      estado_nuevo: estadoNuevo,
      notas: notas || undefined,
    });
    setEstadoNuevo("");
    setNotas("");
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEstadoNuevo("");
    setNotas("");
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const getLabel = (key: string) =>
    (ESTADO_LABELS as Record<string, string>)[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <GitCommitVertical size={15} className="text-violet-500" />
            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-widest">
              Historial de seguimiento
            </h3>
            {seguimientos.length > 0 && (
              <span className="text-[10px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                {seguimientos.length}
              </span>
            )}
          </div>

          {puedeActualizar && siguientes.length > 0 && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${showForm
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
                }`}
            >
              <Plus
                size={12}
                className={`transition-transform duration-200 ${showForm ? "rotate-45" : ""}`}
              />
              {showForm ? "Cancelar" : "Registrar cambio"}
            </button>
          )}
        </div>

        {/* ── Formulario ── */}
        {showForm && puedeActualizar && (
          <div className="px-6 py-5 bg-gray-50/70 border-b border-gray-100 space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Nuevo cambio de estado
            </p>

            {/* Estado actual → selector */}
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${ESTADO_COLORS[estadoActual]?.pill ?? "bg-gray-100 text-gray-600"
                }`}>
                {getLabel(estadoActual)}
              </span>
              <span className="text-gray-300 text-sm shrink-0">→</span>
              <select
                value={estadoNuevo}
                onChange={e => setEstadoNuevo(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              >
                <option value="">Seleccionar nuevo estado…</option>
                {siguientes.map(s => (
                  <option key={s} value={s}>{getLabel(s)}</option>
                ))}
              </select>
            </div>

            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones del cambio (opcional)…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !estadoNuevo}
                className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
              >
                {isLoading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CheckCircle2 size={12} />
                }
                Guardar cambio
              </button>
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="px-6 py-5">
          {seguimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <GitCommitVertical size={18} className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Sin seguimientos registrados
              </p>
            </div>
          ) : (
            <ol className="space-y-0">
              {seguimientos.map((seg: any, i: number) => {
                const dotColor = ESTADO_COLORS[seg.estado_nuevo]?.dot ?? "bg-gray-300";
                const isFirst = i === 0;

                return (
                  <li key={seg.id} className="flex gap-4">
                    {/* Dot + línea vertical */}
                    <div className="flex flex-col items-center shrink-0 w-4">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ring-2 ring-white ${dotColor} ${isFirst ? "ring-offset-1 ring-offset-pink-200" : ""
                        }`} />
                      {i < seguimientos.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className={`flex-1 ${i < seguimientos.length - 1 ? "pb-5" : "pb-0"}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {seg.estado_anterior && (
                            <>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[seg.estado_anterior]?.pill ?? "bg-gray-100 text-gray-500"
                                }`}>
                                {getLabel(seg.estado_anterior)}
                              </span>
                              <span className="text-gray-300 text-[10px] font-black">→</span>
                            </>
                          )}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[seg.estado_nuevo]?.pill ?? "bg-gray-100 text-gray-500"
                            }`}>
                            {getLabel(seg.estado_nuevo)}
                          </span>
                        </div>
                        <time className="text-[10px] text-gray-400 font-mono shrink-0">
                          {formatDate(seg.created_at)}
                        </time>
                      </div>

                      {seg.notas && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <MessageSquare size={11} className="text-gray-300 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-500 leading-relaxed">{seg.notas}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
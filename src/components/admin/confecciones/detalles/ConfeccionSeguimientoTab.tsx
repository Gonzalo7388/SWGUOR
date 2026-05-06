"use client";

import { useState }      from "react";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { ESTADO_LABELS } from "@/lib/schemas/confecciones";

const ESTADO_COLORS: Record<string, string> = {
  pendiente:   "bg-slate-100  text-slate-700",
  en_proceso:  "bg-blue-100   text-blue-700",
  completada:  "bg-green-100  text-green-700",
  rechazada:   "bg-amber-100  text-amber-700",
  cancelado:   "bg-red-100    text-red-700",
};

const SIGUIENTE_ESTADO: Record<string, string[]> = {
  pendiente:  ["en_proceso", "rechazada", "cancelado"],
  en_proceso: ["completada", "rechazada", "cancelado"],
  completada: ["cancelado"],
  rechazada:  ["pendiente", "cancelado"],
};

interface Props {
  confeccionId:    string;
  seguimientos:    any[];
  estadoActual:    string;
  puedeActualizar: boolean;
  isLoading?:      boolean;
  onUpdate:        (data: {
    confeccion_id:   string;
    estado_anterior: string;
    estado_nuevo:    string;
    notas?:          string;
  }) => void;
}

export function ConfeccionSeguimientoTab({
  confeccionId, seguimientos, estadoActual, puedeActualizar, isLoading = false, onUpdate,
}: Props) {
  const [showForm,    setShowForm]    = useState(false);
  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [notas,       setNotas]       = useState("");

  const siguientes = SIGUIENTE_ESTADO[estadoActual] ?? [];

  const handleSubmit = () => {
    if (!estadoNuevo) return;

    onUpdate({
      confeccion_id:   confeccionId,
      estado_anterior: estadoActual,
      estado_nuevo:    estadoNuevo,
      notas:           notas || undefined,
    });

    setEstadoNuevo("");
    setNotas("");
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-violet-500 rounded-full" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
            Historial de seguimiento
          </h3>
        </div>
        {puedeActualizar && siguientes.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 uppercase tracking-widest"
          >
            <Plus size={13} /> Registrar cambio
          </button>
        )}
      </div>

      {showForm && puedeActualizar && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          <select
            value={estadoNuevo}
            onChange={e => setEstadoNuevo(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">Seleccionar nuevo estado...</option>
            {siguientes.map(s => (
              <option key={s} value={s}>
                {ESTADO_LABELS[s as keyof typeof ESTADO_LABELS] ?? s}
              </option>
            ))}
          </select>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones del cambio..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[70px] resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !estadoNuevo}  // ✅ usa isLoading del hook
              className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all disabled:opacity-60"
            >
              {isLoading
                ? <Loader2 size={13} className="animate-spin" />
                : <CheckCircle2 size={13} />
              }
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Timeline — sin cambios */}
      <div className="space-y-3">
        {seguimientos.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Sin seguimientos registrados
          </p>
        ) : (
          seguimientos.map((seg: any, i: number) => (
            <div key={seg.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-pink-500" : "bg-gray-200"}`} />
                {i < seguimientos.length - 1 && (
                  <div className="w-px flex-1 bg-gray-100 mt-1" />
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {seg.estado_anterior && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[seg.estado_anterior] ?? "bg-gray-100 text-gray-500"}`}>
                      {ESTADO_LABELS[seg.estado_anterior as keyof typeof ESTADO_LABELS] ?? seg.estado_anterior}
                    </span>
                  )}
                  {seg.estado_anterior && <span className="text-gray-300 text-xs">→</span>}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[seg.estado_nuevo] ?? "bg-gray-100 text-gray-500"}`}>
                    {ESTADO_LABELS[seg.estado_nuevo as keyof typeof ESTADO_LABELS] ?? seg.estado_nuevo}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {new Date(seg.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {seg.notas && (
                  <p className="text-xs text-gray-500 mt-0.5">{seg.notas}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
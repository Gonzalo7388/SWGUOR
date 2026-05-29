"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";

const ESTADOS = ["pendiente", "en_produccion", "listo_para_despacho", "entregado", "cancelado"] as const;

// Usamos el tipo derivado de los estados para mitigar errores de indexación
type EstadoPedido = typeof ESTADOS[number];

const ESTADO_COLORS: Record<EstadoPedido, string> = {
  pendiente:           "bg-amber-100 text-amber-700",
  en_produccion:       "bg-blue-100 text-blue-700",
  listo_para_despacho: "bg-emerald-100 text-emerald-700",
  entregado:           "bg-gray-100 text-gray-600",
  cancelado:           "bg-red-100 text-red-700",
};

// ── Types ─────────────────────────────────────────────────────

export interface SeguimientoPedidoRow {
  id: string;
  pedido_id: string;
  status: EstadoPedido | string;
  notas?: string | null;
  created_at: string | Date;
}

interface Props {
  pedidoId: string;
  seguimientos: SeguimientoPedidoRow[];
  isLoading?: boolean;  
  onUpdate: (nuevo: { pedido_id: string; status: string; notas?: string }) => void;
}

// ── Component ─────────────────────────────────────────────────

export function PedidoSeguimiento({ pedidoId, seguimientos, isLoading = false, onUpdate }: Props) {
  const [estado, setEstado] = useState("");
  const [notas, setNotas] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { can } = usePermissions();

  const puedeActualizar = can("edit", "pedidos") || can("update_status", "pedidos");

  const handleSubmit = () => {
    if (!estado) { 
      toast.error("Selecciona un estado"); 
      return; 
    }
    onUpdate({ 
      pedido_id: pedidoId, 
      status: estado, 
      ...(notas.trim() && { notas: notas.trim() }) 
    });
    setEstado("");
    setNotas("");
    setShowForm(false);
  };

  // Formateador seguro de fechas para evitar excepciones de parseo en el cliente
  const formatFecha = (dateSource: string | Date) => {
    try {
      const d = new Date(dateSource);
      if (isNaN(d.getTime())) return "Fecha no válida";
      return d.toLocaleDateString('es-PE', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return "Sin fecha";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
            Seguimiento del pedido
          </h3>
        </div>
        {puedeActualizar && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 uppercase tracking-widest transition-colors"
          >
            <Plus size={13} /> Actualizar estado
          </button>
        )}
      </div>

      {/* Formulario de Actualización */}
      {showForm && puedeActualizar && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">Seleccionar nuevo estado...</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
            ))}
          </select>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Notas opcionales..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[70px] resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-1">
        {seguimientos.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Sin seguimientos registrados</p>
        ) : (
          seguimientos.map((seg, i) => (
            <div key={seg.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                {/* El círculo inicial se destaca si es el primer hito en pantalla */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-pink-500 ring-4 ring-pink-100" : "bg-gray-300"}`} />
                {i < seguimientos.length - 1 && (
                  <div className="w-px flex-1 bg-gray-200 my-1" />
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ESTADO_COLORS[seg.status as EstadoPedido] ?? "bg-gray-100 text-gray-600"}`}>
                    {seg.status?.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {formatFecha(seg.created_at)}
                  </span>
                </div>
                {seg.notas && (
                  <p className="text-xs text-gray-600 bg-gray-50/50 rounded-lg p-2 border border-gray-100/60 mt-1.5 italic">
                    {seg.notas}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
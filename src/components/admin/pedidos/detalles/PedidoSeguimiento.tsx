"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";

const ESTADOS = ["pendiente", "en_produccion", "listo_para_despacho", "entregado", "cancelado"];

const ESTADO_COLORS: Record<string, string> = {
  pendiente:           "bg-amber-100 text-amber-700",
  en_produccion:       "bg-blue-100 text-blue-700",
  listo_para_despacho: "bg-emerald-100 text-emerald-700",
  entregado:           "bg-gray-100 text-gray-600",
  cancelado:           "bg-red-100 text-red-700",
};

interface Props {
  pedidoId:    string;
  seguimientos: any[];
  isLoading?:  boolean;  
  onUpdate:    (nuevo: any) => void;
}

export function PedidoSeguimiento({ pedidoId, seguimientos, isLoading = false, onUpdate }: Props) {
  const [estado,   setEstado]   = useState("");
  const [notas,    setNotas]    = useState("");
  const [showForm, setShowForm] = useState(false);
  const { can } = usePermissions();

  const puedeActualizar = can("edit", "pedidos") || can("update_status", "pedidos");

   const handleSubmit = () => {
    if (!estado) { toast.error("Selecciona un estado"); return; }
    onUpdate({ pedido_id: pedidoId, status: estado, notas: notas || undefined });
    setEstado("");
    setNotas("");
    setShowForm(false);
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 uppercase tracking-widest"
          >
            <Plus size={13} /> Actualizar estado
          </button>
        )}
      </div>

      {/* Formulario */}
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
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
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
      <div className="space-y-3">
        {seguimientos.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Sin seguimientos registrados</p>
        ) : (
          seguimientos.map((seg: any, i: number) => (
            <div key={seg.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-pink-500" : "bg-gray-200"}`} />
                {i < seguimientos.length - 1 && (
                  <div className="w-px flex-1 bg-gray-100 mt-1" />
                )}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[seg.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {seg.status?.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(seg.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
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

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Factory, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const ESTADO_COLORS: Record<string, string> = {
  pendiente:    "bg-amber-100 text-amber-700",
  en_proceso:   "bg-blue-100 text-blue-700",
  completada:   "bg-emerald-100 text-emerald-700",
  rechazada:    "bg-red-100 text-red-700",
  enviada:      "bg-purple-100 text-purple-700",
};

const ETAPAS = ["corte", "costura", "bordado", "acabado", "control_calidad", "entrega"];

interface Props {
  ordenes:  any[];
  onUpdate: (orden: any) => void;
}

export function OrdenesProduccionList({ ordenes, onUpdate }: Props) {
  const [expandida, setExpandida] = useState<string | null>(null);
  const [loading,   setLoading]   = useState<string | null>(null);

  const actualizarEtapa = async (ordenId: string, etapa: string) => {
    setLoading(ordenId);
    try {
      const res = await fetch("/api/admin/seguimiento-produccion", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orden_id: ordenId, etapa }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(`Etapa actualizada: ${etapa}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  if (!ordenes.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center space-y-3">
        <Factory className="mx-auto text-gray-300" size={32} />
        <p className="text-sm font-bold text-gray-400">Sin órdenes de producción</p>
        <p className="text-xs text-gray-400">
          Usa el botón <span className="font-bold text-pink-600">Nueva orden de producción</span> para crear una.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ordenes.map((orden: any) => {
        const isOpen    = expandida === orden.id;
        const etapaActual = orden.seguimientos?.[0]?.etapa ?? null;

        return (
          <div key={orden.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Cabecera orden */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandida(isOpen ? null : orden.id)}
            >
              <div className="flex items-center gap-3">
                <Factory size={16} className="text-pink-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {orden.producto?.nombre ?? "Producto"}
                    <span className="text-gray-400 font-mono text-xs ml-2">#{orden.id}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Taller: <span className="font-bold text-gray-600">{orden.taller?.nombre ?? "—"}</span>
                    {" · "}{orden.cantidad_solicitada} uds.
                    {orden.fecha_entrega && ` · Entrega: ${new Date(orden.fecha_entrega).toLocaleDateString('es-PE')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ESTADO_COLORS[orden.estado] ?? "bg-gray-100 text-gray-500"}`}>
                  {orden.estado}
                </span>
                {isOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
              </div>
            </div>

            {/* Detalle expandido */}
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4">

                {/* Etapas */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Etapa actual
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ETAPAS.map(etapa => (
                      <button
                        key={etapa}
                        onClick={() => actualizarEtapa(orden.id, etapa)}
                        disabled={loading === orden.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${
                          etapaActual === etapa
                            ? "bg-pink-600 text-white border-pink-600"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-600"
                        }`}
                      >
                        {loading === orden.id && etapaActual !== etapa ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          etapa.replace(/_/g, " ")
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info ficha */}
                {orden.ficha && (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ficha técnica</p>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">
                        v{orden.ficha.version}
                        <span className="ml-2 font-normal text-gray-400">{orden.ficha.estado}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Notas */}
                {orden.notas && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Notas</p>
                    <p className="text-xs text-gray-600">{orden.notas}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
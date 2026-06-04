"use client";

import { useState } from "react";
import { ArrowLeft, Scissors, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ConfeccionHeader } from "./ConfeccionHeader";
import ConfeccionSeguimientoTab, { type SeguimientoPayload } from "./ConfeccionSeguimientoTab";
import { ConfeccionInfoTab } from "./ConfeccionInfoTab";
import { ESTADO_LABELS } from "@/lib/schemas/confecciones";
import { useConfeccionDetalle } from "@/lib/hooks/useConfecciones";

const TABS = [
  { id: "info", label: "Información", icon: FileText },
  { id: "seguimiento", label: "Seguimiento", icon: Clock },
] as const;

type TabId = typeof TABS[number]["id"];

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-slate-100  text-slate-700",
  en_corte: "bg-blue-100   text-blue-700",
  en_costura: "bg-violet-100 text-violet-700",
  acabados: "bg-amber-100  text-amber-700",
  completado: "bg-green-100  text-green-700",
  cancelado: "bg-red-100    text-red-700",
};

export default function ConfeccionDetalle({ confeccion }: { confeccion: any }) {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const { can, hasRole } = usePermissions();
  const {
    updateEstado,
    registrarSeguimiento,
    isUpdating,
    isRegistrando,
  } = useConfeccionDetalle(confeccion.id.toString());
  const seguimientos = confeccion.seguimientos ?? [];
  const estadoActual = confeccion.estado;

  const puedeActualizar =
    hasRole(["administrador", "gerente", "representante_taller"]) ||
    can("update_status", "confecciones");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

        {/* Breadcrumb */}
        <div>
          <Link
            href="/admin/Panel-Administrativo/confecciones"
            className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-xs font-bold uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={13} />
            Volver a Confecciones
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-600 rounded-xl">
                <Scissors className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {confeccion.prenda}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-mono">#{confeccion.id}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ESTADO_COLORS[estadoActual] ?? "bg-gray-100 text-gray-600"}`}>
                    {ESTADO_LABELS[estadoActual as keyof typeof ESTADO_LABELS] ?? estadoActual}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header con info clave */}
        <ConfeccionHeader confeccion={confeccion} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === id
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Icon size={13} />
              {label}
              {id === "seguimiento" && seguimientos.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                  {seguimientos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {activeTab === "info" && (
          <ConfeccionInfoTab
            confeccion={confeccion}
            estadoActual={estadoActual}
            puedeActualizar={puedeActualizar}
            onEstadoChange={(nuevoEstado) => updateEstado(nuevoEstado)}
          />
        )}

        {activeTab === "seguimiento" && (
          <ConfeccionSeguimientoTab
            confeccionId={confeccion.id.toString()}
            seguimientos={seguimientos}
            estadoActual={estadoActual}
            puedeActualizar={puedeActualizar}
            isLoading={isUpdating}
            onUpdate={(data: SeguimientoPayload) => registrarSeguimiento(data)}
          />
        )}
      </div>
    </div>
  );
}
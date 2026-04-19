"use client";

import { useState } from "react";
import { ArrowLeft, ShoppingBag, Clock, Factory } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PedidoHeader }         from "./PedidoHeader";
import { PedidoItems }          from "./PedidoItems";
import { PedidoSeguimiento }    from "./PedidoSeguimiento";
import { OrdenesProduccionList } from "./OrdenesProduccionList";
import { CrearOrdenModal }       from "./CrearOrdenModal";
import { usePedidos }          from "@/lib/hooks/usePedidos";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { ESTADO_PEDIDO_LABELS, PRIORIDAD_PEDIDO_LABELS } from "@/lib/schemas/pedidos"

const TABS = [
  { id: "items",      label: "Items",          icon: ShoppingBag },
  { id: "seguimiento", label: "Seguimiento",   icon: Clock       },
  { id: "produccion",  label: "Producción",    icon: Factory     },
] as const;

type TabId = typeof TABS[number]["id"];

interface PedidoDetalleProps {
  pedido:   any;
  talleres: any[];
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente:           "bg-amber-100 text-amber-700",
  en_produccion:       "bg-blue-100 text-blue-700",
  listo_para_despacho: "bg-emerald-100 text-emerald-700",
  entregado:           "bg-gray-100 text-gray-600",
  cancelado:           "bg-red-100 text-red-700",
};

const PRIORIDAD_COLORS: Record<string, string> = {
  baja:   "bg-gray-100 text-gray-500",
  normal: "bg-blue-100 text-blue-600",
};

export default function PedidoDetalle({ pedido, talleres }: PedidoDetalleProps) {
  const [activeTab,      setActiveTab]      = useState<TabId>("items");
  const [modalOpen,      setModalOpen]      = useState(false);
  const { update, registrarSeguimiento, isUpdating } = usePedidos();
  const { ordenes, create, registrarEtapa, isCreating } = useOrdenesProduccion();
  const { can } = usePermissions();

  const puedeCrearOrden = can("create", "confecciones") || can("edit", "productos");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

        {/* Header */}
        <div>
          <Link
            href="/admin/Panel-Administrativo/pedidos"
            className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-xs font-bold uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={13} />
            Volver a Pedidos
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-600 rounded-xl">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pedido #{pedido.id}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ESTADO_COLORS[pedido.estado] ?? "bg-gray-100 text-gray-600"}`}>
                    {ESTADO_PEDIDO_LABELS[pedido.estado] ?? pedido.estado}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PRIORIDAD_COLORS[pedido.prioridad] ?? "bg-gray-100 text-gray-500"}`}>
                    {PRIORIDAD_PEDIDO_LABELS[pedido.prioridad] ?? pedido.prioridad}
                  </span>
                </div>
              </div>
            </div>

            {puedeCrearOrden && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <Factory size={14} />
                Nueva orden de producción
              </button>
            )}
          </div>
        </div>

        {/* Info cliente + totales */}
        <PedidoHeader pedido={pedido} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === id
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={13} />
              {label}
              {id === "produccion" && ordenes.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {ordenes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido tabs */}
        {activeTab === "items" && (
          <PedidoItems items={pedido.pedido_items ?? []} />
        )}
        {activeTab === "seguimiento" && (
          <PedidoSeguimiento
            pedidoId={pedido.id}
            seguimientos={pedido.seguimiento_pedido ?? []}
            isLoading={isUpdating}
            onUpdate={(data) => registrarSeguimiento({ pedido_id: pedido.id, ...data })}
          />
        )}
        {activeTab === "produccion" && (
          <OrdenesProduccionList
            ordenes={pedido.confecciones ?? []} 
            onUpdate={(actualizada) => registrarEtapa({ orden_id: actualizada.id, etapa: actualizada.etapa_actual })}
          />
        )}
      </div>

      {/* Modal crear orden */}
      <CrearOrdenModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pedido={pedido}
        talleres={talleres}
        onSuccess={(data) => {
          create(data);   
          setModalOpen(false);
          setActiveTab("produccion");
        }}
      />
    </div>
  );
}
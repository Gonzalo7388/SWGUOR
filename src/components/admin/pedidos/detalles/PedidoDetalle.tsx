"use client";

import { useState } from "react";
import { ArrowLeft, ShoppingBag, Clock, Factory } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PedidoHeader } from "./PedidoHeader";
import { PedidoItems, type ItemPedidoRow } from "./PedidoItems";
import { PedidoSeguimiento, type SeguimientoPedidoRow } from "./PedidoSeguimiento";
import { OrdenesProduccionList } from "./OrdenesProduccionList";
import { CrearOrdenModal } from "./CrearOrdenModal";
import { usePedidos } from "@/lib/hooks/usePedidos";
import { useCreateOrdenProduccion } from "@/lib/hooks/useOrdenProduccion";
import { ESTADO_PEDIDO_LABELS, PRIORIDAD_PEDIDO_LABELS } from "@/lib/schemas/pedidos";

const TABS = [
  { id: "items",       label: "Items",          icon: ShoppingBag },
  { id: "seguimiento", label: "Seguimiento",    icon: Clock       },
  { id: "produccion",  label: "Producción",     icon: Factory     },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Tipos y Estructuras de Datos Estrictas Saneadas ──

export interface ConfeccionOrdenRow {
  id: string | number;
  pedido_id: string | number;
  taller_id: string | number;
  etapa_actual: string;
  created_at: string | Date;
  [key: string]: string | number | boolean | unknown;
}

export interface DetallePedidoData {
  id: string | number;
  estado: "pendiente" | "en_produccion" | "listo_para_despacho" | "entregado" | "cancelado" | string;
  prioridad: "baja" | "normal" | "alta" | string;
  cliente_id?: string | number | null;
  total?: number;
  created_at?: string | Date;
  pedido_items?: ItemPedidoRow[];
  seguimiento_pedido?: SeguimientoPedidoRow[];
  confecciones?: ConfeccionOrdenRow[];
  // Se añade la propiedad que Prisma mapea de forma nativa en la base de datos relacional
  ordenes_produccion?: ConfeccionOrdenRow[];
  [key: string]: string | number | boolean | unknown;
}

export interface TallerOption {
  id: string | number;
  nombre: string;
  encargado?: string | null;
  email?: string | null;
  contacto?: string | null;
  especialidad?: string | null;
}

interface PedidoDetalleProps {
  pedido: DetallePedidoData;
  talleres: TallerOption[];
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
  alta:   "bg-red-100 text-red-600",
};

// ── Componente Principal ───────────────────────────────────────
export default function PedidoDetalle({ pedido, talleres }: PedidoDetalleProps) {
  const [activeTab, setActiveTab] = useState<TabId>("items");
  const [modalOpen, setModalOpen] = useState(false);
  const { registrarSeguimiento, isUpdating } = usePedidos();
  const { create, registrarEtapa } = useCreateOrdenProduccion();
  
  const { can } = usePermissions();

  const puedeCrearOrden = can("create", "confecciones") || can("edit", "productos");

  // Se unifican las fuentes de datos tipadas en una constante segura
  const listaOrdenes = pedido.confecciones ?? pedido.ordenes_produccion ?? [];
  const totalOrdenes = listaOrdenes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

        {/* Header de navegación superior */}
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
              <div className="p-2.5 bg-pink-600 rounded-xl shadow-md shadow-pink-100">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pedido #{pedido.id}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ESTADO_COLORS[pedido.estado] ?? "bg-gray-100 text-gray-600"}`}>
                    {ESTADO_PEDIDO_LABELS[pedido.estado as keyof typeof ESTADO_PEDIDO_LABELS] ?? pedido.estado}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PRIORIDAD_COLORS[pedido.prioridad] ?? "bg-gray-100 text-gray-500"}`}>
                    {PRIORIDAD_PEDIDO_LABELS[pedido.prioridad as keyof typeof PRIORIDAD_PEDIDO_LABELS] ?? pedido.prioridad}
                  </span>
                </div>
              </div>
            </div>

            {puedeCrearOrden && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-100 active:scale-95"
              >
                <Factory size={14} />
                Nueva orden de producción
              </button>
            )}
          </div>
        </div>

        {/* Sección informativa del Cliente y Costos Totales */}
        <PedidoHeader pedido={pedido} />

        {/* Pestañas de Navegación Exclusivas */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === id
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={13} />
              {label}
              {id === "produccion" && totalOrdenes > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'produccion' ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-600'}`}>
                  {totalOrdenes}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Renderizado Condicional del Contenido de los Tabs */}
        <main>
          {activeTab === "items" && (
            <PedidoItems items={pedido.pedido_items ?? []} />
          )}
          
          {activeTab === "seguimiento" && (
            <PedidoSeguimiento
              pedidoId={String(pedido.id)}
              seguimientos={pedido.seguimiento_pedido ?? []}
              isLoading={isUpdating}
              onUpdate={(data) => registrarSeguimiento({ ...data, pedido_id: String(pedido.id) })}
            />
          )}
          
          {activeTab === "produccion" && (
            <OrdenesProduccionList
              ordenes={listaOrdenes} 
              onUpdate={(actualizada) => registrarEtapa({ orden_id: String(actualizada.id), etapa: actualizada.etapa_actual })}
            />
          )}
        </main>
      </div>

      {/* Modal Desplegable para Asignar Confección a Talleres */}
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
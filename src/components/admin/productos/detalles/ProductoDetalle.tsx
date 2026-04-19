"use client";

import { useState } from "react";
import { ArrowLeft, Package, Ruler, FileText } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/usePermissions";
import ProductForm from "@/components/admin/productos/form/ProductForm";
import { FichaTecnicaTab } from "./FichaTecnicaTab";
import { FichaMedidasTab } from "./FichaMedidasTab";
import { useFichaTecnica, useFichaMedidas } from "@/lib/hooks/useFichasTecnicas";
import { ESTADO_FICHA_LABELS }              from "@/lib/schemas/fichas-tecnicas";

interface ProductoDetalleProps {
  producto: any;
  categorias: any[];
}

const TABS = [
  { id: "general",  label: "General",       icon: Package  },
  { id: "ficha",    label: "Ficha técnica",  icon: FileText },
  { id: "medidas",  label: "Medidas",        icon: Ruler    },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ProductoDetalle({ producto, categorias }: ProductoDetalleProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const { can } = usePermissions();

  const puedeEditarFicha = can("upload", "ficha_tecnica") || can("upload", "ficha_medidas");
  const {
    ficha,
    create: createFicha,
    update: updateFicha,
    isCreating,
    isUpdating,
  } = useFichaTecnica(producto.id.toString());
    const {
    medidas,
    save:   saveMedidas,
    remove: deleteMedida,
    isSaving,
    isDeleting,
  } = useFichaMedidas(ficha?.id ?? "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">

        {/* Header */}
        <div>
          <Link
            href="/admin/Panel-Administrativo/productos"
            className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-xs font-bold uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={13} />
            Volver al Inventario
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-600 rounded-xl">
              <Package className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
              <p className="text-gray-400 text-xs font-mono mt-0.5">{producto.sku}</p>
            </div>
          </div>
        </div>

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
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div>
          {activeTab === "general" && (
            <ProductForm
              mode="edit"
              initialData={producto}
              categorias={categorias}
            />
          )}

          {activeTab === "ficha" && (
            <FichaTecnicaTab
              producto={producto}
              ficha={ficha} 
              onCreate={createFicha} 
              onUpdate={updateFicha}
              isLoading={isCreating || isUpdating}
              canEdit={puedeEditarFicha}
            />
          )}

          {activeTab === "medidas" && (
            <FichaMedidasTab
              fichaId={ficha?.id ?? null}
              medidas={medidas} 
              onSave={saveMedidas}
              onDelete={deleteMedida}
              isLoading={isSaving || isDeleting}
              canEdit={puedeEditarFicha}
            />
          )}
        </div>
      </div>
    </div>
  );
}
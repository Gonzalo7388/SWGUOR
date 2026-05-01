"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVarianteStockResumen } from '@/lib/hooks/useStockResumen';
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { VariantsSection } from "./sections/VariantsSection";
import { generateSKU, generateVariantSKU } from "@/lib/utils/producto-utils";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: any;
  categorias: any[];
  nextId?: number;
}

export default function ProductForm({
  mode,
  initialData,
  categorias,
  nextId,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Hook para obtener stocks actualizados si es necesario
  const { data: variantesDB } = useVarianteStockResumen(
    initialData?.id ? Number(initialData.id) : undefined
  );

  const methods = useForm({
    defaultValues: initialData
      ? {
          ...initialData,
          variantes: initialData.variantes_producto?.map((v: any) => ({
            id: v.id,
            color: v.color,
            talla: v.talla,
            sku: v.sku,
            stock: v.stock,
          })) ?? [],
        }
      : {
          nombre: "",
          precio: "",
          categoria_id: "",
          sku: "",
          estado: "activo",
          variantes: [{ color: "", talla: "", stock: 0, sku: "" }],
        },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const isCreate = mode === "create";
      const url = isCreate
        ? "/api/admin/productos"
        : `/api/admin/productos/${initialData.id}`;

      const categoria = categorias.find(
        c => c.id.toString() === data.categoria_id.toString()
      );
      const catNombre = categoria ? categoria.nombre : "GEN";
      const skuProducto = data.sku || generateSKU(data.nombre, catNombre, nextId || 0);

      const bodyParaAPI = {
        producto: {
          nombre: data.nombre,
          precio: parseFloat(data.precio) || 0,
          categoria_id: parseInt(data.categoria_id),
          sku: skuProducto,
          estado: data.estado || "activo",
          reglas_descuento: data.reglas_descuento || null,
          fichas_tecnicas_id: data.fichas_tecnicas_id || null,
        },
        variantes: (data.variantes || []).map((v: any) => ({
          id: v.id, // Importante enviar el ID para actualizar en lugar de duplicar
          color: v.color,
          talla: v.talla,
          sku: generateVariantSKU(skuProducto, v.color, v.talla),
          stock: parseInt(v.stock_adicional) || 0,
          estado: "activo",
        })),
        nueva_ficha_relacional: data.ficha_tecnica ? {
          version: data.ficha_tecnica.version || "1.0",
          descripcion_detallada: data.ficha_tecnica.descripcion_detallada || "Sin descripción",
          sam_total: parseFloat(data.ficha_tecnica.sam_total) || 0,
          costo_estimado: parseFloat(data.ficha_tecnica.costo_estimado) || 0,
          estado: "Borrador",
          imagen_geometral: null,
        } : null,
      };

      const response = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParaAPI),
      });

      if (!response.ok) throw new Error("Error al guardar el producto");

      toast.success("Producto guardado correctamente");
      router.push("/admin/Panel-Administrativo/productos");
      router.refresh();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8 pb-20">
        
        {/* Barra de acciones superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <Link
              href="/admin/Panel-Administrativo/productos"
              className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-xs font-bold uppercase tracking-widest mb-2 transition-colors"
            >
              <ArrowLeft size={13} />
              Volver al Inventario
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Nuevo Producto" : "Editar Producto"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-10 px-5 font-semibold border-gray-200 text-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white h-10 px-6 font-bold gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
              {mode === "create" ? "Guardar Producto" : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Layout Centralizado de una sola columna para mejor lectura */}
        <div className="space-y-6">
          <SectionCard title="Información General">
            <GeneralInfoSection
              categorias={categorias}
              isEdit={mode === "edit"}
              nextId={nextId}
            />
          </SectionCard>

          <SectionCard title="Gestión de Variantes y Stock">
            <VariantsSection stockResumen={variantesDB || initialData?.variantes_producto} mode={mode} />
          </SectionCard>
        </div>
      </form>
    </FormProvider>
  );
}

function SectionCard({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
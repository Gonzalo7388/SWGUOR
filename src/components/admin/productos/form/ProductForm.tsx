"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVarianteStockResumen } from '@/lib/hooks/useStockResumen';
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { VariantsSection } from "./sections/VariantsSection";
import { TechSheetSection } from "./sections/TechSheetSection";
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
  const { data: variantes } = useVarianteStockResumen(
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
            stock_adicional: v.stock_adicional,
            sku: v.sku,
          })) ?? [],
        }
      : {
          nombre: "",
          precio: "",
          categoria_id: "",
          sku: "",
          estado: "activo",
          variantes: [{ color: "", talla: "", stock_adicional: 0, sku: "" }],
          ficha_tecnica: {
            material: "",
            cuidado: "",
            temporada: "Toda Temporada",
            origen: "Perú",
          },
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
          nombre:            data.nombre,
          precio:            parseFloat(data.precio) || 0,
          categoria_id:      parseInt(data.categoria_id),
          sku:               skuProducto,
          estado:            data.estado || "activo",
          reglas_descuento:  data.reglas_descuento  || null,
          fichas_tecnicas_id: data.fichas_tecnicas_id || null,
        },
        variantes: (data.variantes || []).map((v: any) => ({
          color:           v.color,
          talla:           v.talla,
          sku:             generateVariantSKU(skuProducto, v.color, v.talla),
          stock_adicional: parseInt(v.stock_adicional) || 0,
          estado:          "activo",
        })),
        nueva_ficha_relacional: data.ficha_tecnica ? {
          version:               data.ficha_tecnica.version              || "1.0",
          descripcion_detallada: data.ficha_tecnica.descripcion_detallada || "Sin descripción",
          sam_total:             parseFloat(data.ficha_tecnica.sam_total)  || 0,
          costo_estimado:        parseFloat(data.ficha_tecnica.costo_estimado) || 0,
          estado:                "Borrador",
          imagen_geometral:      null,
        } : null,
      };

      const response = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParaAPI),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error validación API:", result.error);
        throw new Error("Error en los datos. Revisa la consola.");
      }

      toast.success("Operación exitosa");
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
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">

        {/* ── Barra de acciones ── */}
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
            <p className="text-gray-500 text-sm mt-0.5">
              {mode === "create"
                ? "Complete los datos para registrar el producto en el sistema."
                : "Modifique los datos del producto y guarde los cambios."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-10 px-5 font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white h-10 px-6 font-bold gap-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  {mode === "create" ? "Guardar Producto" : "Guardar Cambios"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── Layout principal ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* Columna principal */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <SectionCard>
              <GeneralInfoSection
                categorias={categorias}
                isEdit={mode === "edit"}
                nextId={nextId}
              />
            </SectionCard>

            <SectionCard>
              <VariantsSection stockResumen={variantes} mode={mode} />
            </SectionCard>
          </div>

          {/* Columna lateral */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard>
              <TechSheetSection />
            </SectionCard>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Info size={15} className="shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Nota del sistema
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Este registro impactará automáticamente los módulos de{" "}
                <strong className="text-gray-700">Ventas</strong> y{" "}
                <strong className="text-gray-700">Stock</strong>. El SKU se genera
                automáticamente a partir del nombre y categoría.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 rounded-lg px-3 py-2 border border-pink-100">
                Suma automática de stock habilitada
              </p>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">{children}</div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { VariantsSection } from "./sections/VariantsSection";
import { TechSheetSection } from "./sections/TechSheetSection";

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

  const methods = useForm({
    defaultValues: initialData || {
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

      const response = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          precio: parseFloat(data.precio),
          categoria_id: parseInt(data.categoria_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la solicitud");
      }

      toast.success(
        isCreate ? "Producto registrado correctamente" : "Producto actualizado correctamente"
      );
      router.push("/admin/Panel-Administrativo/productos");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8"
      >
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
              <VariantsSection />
            </SectionCard>
          </div>

          {/* Columna lateral */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SectionCard>
              <TechSheetSection />
            </SectionCard>

            {/* Aviso de sistema */}
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

// Wrapper de sección
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">{children}</div>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSKU } from "@/lib/utils/producto-utils";

// ── Estilos coherentes con la paleta de categorías ──
const FIELD_LABEL =
  "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT =
  "bg-gray-50 border-gray-200 h-11 rounded-lg text-sm font-medium text-gray-800 focus-visible:ring-2 focus-visible:ring-pink-300 transition-all placeholder:text-gray-300";

interface GeneralInfoSectionProps {
  categorias: any[];
  isEdit?: boolean;
  nextId?: number;
}

export function GeneralInfoSection({ categorias, isEdit = false, nextId }: GeneralInfoSectionProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const nombre = watch("nombre");
  const categoria_id = watch("categoria_id");

  useEffect(() => {
    if (isEdit) return;

    if (nombre && categoria_id) {
      const catNombre =
        categorias.find((c) => c.id.toString() === categoria_id)?.nombre || "";
      const newSKU = generateSKU(nombre, catNombre, nextId ?? 0); // ← usar nextId, no idActual
      setValue("sku", newSKU);
    }
  }, [nombre, categoria_id]); 

  return (
    <section className="space-y-5">
      {/* Encabezado de sección */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-1 h-5 bg-pink-500 rounded-full" />
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
          Información General
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* NOMBRE */}
        <div className="col-span-2">
          <Label className={FIELD_LABEL}>Nombre del Producto</Label>
          <Input
            {...register("nombre", { required: "El nombre es obligatorio" })}
            className={FIELD_INPUT}
            placeholder="Ej. Blusa Seda Mariposa"
          />
          {errors.nombre && (
            <p className="text-[11px] text-red-500 font-semibold mt-1">
              {errors.nombre.message as string}
            </p>
          )}
        </div>

        {/* CATEGORÍA */}
        <div>
          <Label className={FIELD_LABEL}>Categoría</Label>
          <Select
            onValueChange={(val) => setValue("categoria_id", val)}
            defaultValue={watch("categoria_id")}
          >
            <SelectTrigger className={FIELD_INPUT}>
              <SelectValue placeholder="Seleccionar categoría..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              {categorias.map((cat) => (
                <SelectItem
                  key={cat.id.toString()}
                  value={cat.id.toString()}
                  className="text-sm font-medium text-gray-700 focus:bg-pink-50 focus:text-pink-700"
                >
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PRECIO */}
        <div>
          <Label className={FIELD_LABEL}>Precio Base (S/.)</Label>
          <Input
            type="number"
            step="0.01"
            {...register("precio", { required: true, min: 0 })}
            className={FIELD_INPUT}
            placeholder="0.00"
          />
        </div>

        {/* ESTADO */}
        <div>
          <Label className={FIELD_LABEL}>Estado</Label>
          <Select
            onValueChange={(val) => setValue("estado", val)}
            defaultValue={watch("estado") || "activo"}
          >
            <SelectTrigger className={FIELD_INPUT}>
              <SelectValue placeholder="Seleccionar estado..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              <SelectItem value="activo" className="font-medium text-emerald-700 focus:bg-emerald-50">
                Activo
              </SelectItem>
              <SelectItem value="inactivo" className="font-medium text-gray-500 focus:bg-gray-50">
                Inactivo
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SKU AUTO-GENERADO */}
        <div className="col-span-2">
          <Label className={FIELD_LABEL}>SKU Maestro (Generado automáticamente)</Label>
          <div className="h-11 flex items-center px-4 rounded-lg bg-gray-100 border border-dashed border-gray-200 text-gray-400 font-mono text-sm select-none">
            {watch("sku") || "Esperando nombre y categoría..."}
            <input type="hidden" {...register("sku")} />
          </div>
        </div>

      </div>
    </section>
  );
}
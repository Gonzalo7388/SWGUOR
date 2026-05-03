"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
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

const FIELD_LABEL = "text-[10px] font-black text-guor-gold/70 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT = "bg-guor-cream/60 border-guor-peach/50 h-11 rounded-xl text-sm font-semibold text-guor-dark/80 focus-visible:ring-2 focus-visible:ring-guor-gold/40 focus-visible:border-guor-gold transition-all shadow-sm w-full";

export function GeneralInfoSection({ categorias, isEdit = false, nextId }: any) {
  const { register, watch, setValue, control, formState: { errors } }  = useFormContext();
  const nombre      = watch("nombre");
  const categoria_id = watch("categoria_id");

  useEffect(() => {
    if (isEdit && categoria_id !== undefined && categoria_id !== null) {
      const asString = String(categoria_id);
      if (categoria_id !== asString) {
        setValue("categoria_id", asString, { shouldDirty: false });
      }
    }

  }, []);

  // ── Auto-generación de SKU en creación
  useEffect(() => {
    if (isEdit) return;
    if (nombre && categoria_id) {
      const cat = categorias.find((c: any) => c.id.toString() === String(categoria_id))?.nombre || "";
      setValue("sku", generateSKU(nombre, cat, nextId ?? 0));
    }
  }, [nombre, categoria_id, categorias, isEdit, nextId, setValue]);

  // Valor normalizado a string para que Radix siempre encuentre el item
  const categoriaValue = categoria_id != null ? String(categoria_id) : "";

  return (
    <div className="max-w-4xl mx-auto w-full py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

        <div className="md:col-span-2">
          <Label className={FIELD_LABEL}>Nombre del Producto</Label>
          <Input {...register("nombre", { required: "Obligatorio" })} className={FIELD_INPUT} />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Categoría</Label>
          <Controller
            name="categoria_id"
            control={control}  // desestructura control desde useFormContext()
            render={({ field }) => (
              <Select
                onValueChange={(val) => field.onChange(val)}
                value={field.value != null ? String(field.value) : ""}
              >
                <SelectTrigger className={FIELD_INPUT}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl">
                  {categorias.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Precio Base (S/.)</Label>
          <Input type="number" step="0.01" {...register("precio")} className={FIELD_INPUT} />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Estado</Label>
          <Select
            onValueChange={(val) => setValue("estado", val, { shouldDirty: true })}
            value={watch("estado") || "activo"}
          >
            <SelectTrigger className={FIELD_INPUT}><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="activo"   className="font-bold text-emerald-600">ACTIVO</SelectItem>
              <SelectItem value="inactivo" className="font-bold text-guor-gold/70">INACTIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>SKU Maestro (Sistema)</Label>
          <div className="h-11 flex items-center px-4 rounded-xl bg-guor-peach/40 border border-dashed border-guor-peach text-guor-gold/70 font-mono text-[12px] tracking-wider">
            {watch("sku") || "AUTO-GENERADO"}
          </div>
        </div>

      </div>
    </div>
  );
}
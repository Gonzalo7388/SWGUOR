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

const FIELD_LABEL = "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT = "bg-gray-50/50 border-gray-100 h-11 rounded-xl text-sm font-semibold text-gray-700 focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:border-pink-300 transition-all shadow-sm w-full";

export function GeneralInfoSection({ categorias, isEdit = false, nextId }: any) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const nombre = watch("nombre");
  const categoria_id = watch("categoria_id");

  useEffect(() => {
    if (isEdit) return;
    if (nombre && categoria_id) {
      const cat = categorias.find((c: any) => c.id.toString() === categoria_id)?.nombre || "";
      setValue("sku", generateSKU(nombre, cat, nextId ?? 0));
    }
  }, [nombre, categoria_id, categorias, isEdit, nextId, setValue]);

  return (
    /* Contenedor centralizado con ancho máximo */
    <div className="max-w-4xl mx-auto w-full py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        
        <div className="md:col-span-2">
          <Label className={FIELD_LABEL}>Nombre del Producto</Label>
          <Input {...register("nombre", { required: "Obligatorio" })} className={FIELD_INPUT} />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Categoría</Label>
          <Select onValueChange={(val) => setValue("categoria_id", val)} value={categoria_id?.toString()}>
            <SelectTrigger className={FIELD_INPUT}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              {categorias.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Precio Base (S/.)</Label>
          <Input type="number" step="0.01" {...register("precio")} className={FIELD_INPUT} />
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>Estado</Label>
          <Select onValueChange={(val) => setValue("estado", val)} value={watch("estado") || "activo"}>
            <SelectTrigger className={FIELD_INPUT}><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="activo" className="font-bold text-emerald-600">ACTIVO</SelectItem>
              <SelectItem value="inactivo" className="font-bold text-gray-400">INACTIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>SKU Maestro (Sistema)</Label>
          <div className="h-11 flex items-center px-4 rounded-xl bg-gray-100/50 border border-dashed border-gray-200 text-gray-400 font-mono text-[12px] tracking-wider">
            {watch("sku") || "AUTO-GENERADO"}
          </div>
        </div>
      </div>
    </div>
  );
}
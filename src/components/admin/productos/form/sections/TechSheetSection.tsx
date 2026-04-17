"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Importamos Textarea para la descripción

const FIELD_LABEL =
  "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT =
  "bg-gray-50 border-gray-200 h-11 rounded-lg text-sm font-medium text-gray-800 focus-visible:ring-2 focus-visible:ring-pink-300 transition-all placeholder:text-gray-300";

export function TechSheetSection() {
  const { register } = useFormContext();

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-1 h-5 bg-emerald-500 rounded-full" />
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
          Ficha Técnica de Producción
        </h3>
      </div>

      <div className="space-y-4">
        
        {/* DESCRIPCIÓN DETALLADA (Columna: descripcion_detallada) */}
        <div>
          <Label className={FIELD_LABEL}>Descripción del Producto</Label>
          <Textarea
            {...register("ficha_tecnica.descripcion_detallada")}
            className="bg-gray-50 border-gray-200 rounded-lg text-sm min-h-[100px] focus-visible:ring-2 focus-visible:ring-pink-300"
            placeholder="Detalles de confección, materiales y acabados..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* SAM TOTAL (Columna: sam_total) */}
          <div>
            <Label className={FIELD_LABEL}>SAM Total (Minutos)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("ficha_tecnica.sam_total")}
              className={FIELD_INPUT}
              placeholder="Ej. 12.5"
            />
          </div>

          {/* COSTO ESTIMADO (Columna: costo_estimado) */}
          <div>
            <Label className={FIELD_LABEL}>Costo Estimado (S/.)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("ficha_tecnica.costo_estimado")}
              className={FIELD_INPUT}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* VERSIÓN (Columna: version) */}
        <div>
          <Label className={FIELD_LABEL}>Versión de Ficha</Label>
          <Input
            {...register("ficha_tecnica.version")}
            className={FIELD_INPUT}
            defaultValue="1.0"
            placeholder="Ej. V1 - Inicial"
          />
        </div>

        {/* Campo oculto para el estado inicial */}
        <input type="hidden" {...register("ficha_tecnica.estado")} value="Borrador" />
      </div>

      <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 leading-relaxed">
        Los valores de SAM y Costo impactarán directamente en el módulo de Producción.
      </p>
    </section>
  );
}
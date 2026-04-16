"use client";

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

const FIELD_LABEL =
  "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT =
  "bg-gray-50 border-gray-200 h-11 rounded-lg text-sm font-medium text-gray-800 focus-visible:ring-2 focus-visible:ring-pink-300 transition-all placeholder:text-gray-300";

export function TechSheetSection() {
  const { register, setValue, watch } = useFormContext();

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-1 h-5 bg-emerald-500 rounded-full" />
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
          Especificaciones Técnicas
        </h3>
      </div>

      <div className="space-y-4">

        {/* MATERIAL */}
        <div>
          <Label className={FIELD_LABEL}>Composición / Material</Label>
          <Input
            {...register("ficha_tecnica.material")}
            className={FIELD_INPUT}
            placeholder="Ej. 95% Algodón, 5% Elastano"
          />
        </div>

        {/* CUIDADOS */}
        <div>
          <Label className={FIELD_LABEL}>Instrucciones de Lavado</Label>
          <Input
            {...register("ficha_tecnica.cuidado")}
            className={FIELD_INPUT}
            placeholder="Lavar a mano, no usar secadora"
          />
        </div>

        {/* TEMPORADA */}
        <div>
          <Label className={FIELD_LABEL}>Temporada Sugerida</Label>
          <Select
            onValueChange={(val) => setValue("ficha_tecnica.temporada", val)}
            value={watch("ficha_tecnica.temporada")}
          >
            <SelectTrigger className={FIELD_INPUT}>
              <SelectValue placeholder="Seleccionar temporada..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              <SelectItem value="Primavera-Verano">Primavera – Verano</SelectItem>
              <SelectItem value="Otoño-Invierno">Otoño – Invierno</SelectItem>
              <SelectItem value="Toda Temporada">Toda Temporada</SelectItem>
              <SelectItem value="Lanzamiento Especial">Edición Limitada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PAÍS DE ORIGEN */}
        <div>
          <Label className={FIELD_LABEL}>País de Fabricación</Label>
          <Input
            {...register("ficha_tecnica.origen")}
            className={FIELD_INPUT}
            placeholder="Ej. Perú"
          />
        </div>

      </div>

      <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 leading-relaxed">
        Esta información será visible en la ficha de detalle del producto.
      </p>
    </section>
  );
}
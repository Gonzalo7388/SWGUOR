"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VarianteStockResumen } from '@/lib/hooks/useStockResumen';

interface VariantsSectionProps {
  stockResumen?: VarianteStockResumen[];
}

const CELL_INPUT =
  "h-10 bg-transparent border-none text-sm font-medium text-gray-700 focus-visible:ring-1 focus-visible:ring-pink-200 placeholder:text-gray-300 rounded-lg";

export function VariantsSection({ stockResumen = [] }: VariantsSectionProps) {
  const { control, register, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });

  const skuMaestro = watch("sku") || "SKU";

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-pink-500 rounded-full" />
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
              Variantes de Inventario
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Tallas, colores y existencias por variante
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => append({ color: "", talla: "", stock_adicional: 0, sku: "" })}
          className="bg-gray-900 hover:bg-gray-700 text-white h-9 px-4 rounded-lg font-bold text-xs gap-1.5 transition-all active:scale-95"
        >
          <Plus size={14} /> Agregar
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left">
                Color
              </th>
              <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left">
                Talla
              </th>
              <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left">
                SKU Variante
              </th>
              <th className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-center">
                Stock
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fields.map((field, index) => (
              <tr key={field.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">
                  <Input
                    {...register(`variantes.${index}.color` as const, { required: true })}
                    placeholder="Ej. Negro"
                    className={CELL_INPUT}
                  />
                </td>
                <td className="px-3 py-2 w-28">
                  <Input
                    {...register(`variantes.${index}.talla` as const, { required: true })}
                    placeholder="M"
                    className={`${CELL_INPUT} text-center`}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    {...register(`variantes.${index}.sku` as const)}
                    placeholder={`${skuMaestro}-VAR`}
                    className={`${CELL_INPUT} font-mono text-[11px] text-gray-400 uppercase`}
                  />
                </td>
                <td className="px-3 py-2 w-28">
                  <Input
                    type="number"
                    {...register(`variantes.${index}.stock_adicional` as const, {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className="h-10 bg-gray-100 border-none rounded-lg font-bold text-gray-700 text-center focus-visible:ring-1 focus-visible:ring-pink-200"
                  />
                </td>
                <td className="px-3 py-2 text-right w-12">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fields.length === 0 && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest py-8">
          Agrega al menos una variante para controlar el stock
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-1">
        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          Total variantes:{" "}
          <span className="text-pink-600 font-black">{fields.length}</span>
        </span>
      </div>
    </section>
  );
}
"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Box, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateVariantSKU } from "@/lib/utils/producto-utils";

export function VariantsSection({ stockResumen = [] }: any) {
  const { control, register, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "variantes" });

  const skuMaestro = watch("sku") || "SKU";

  // Sincronización forzada usando solo la propiedad 'stock'
  useEffect(() => {
    if (stockResumen && stockResumen.length > 0) {
      stockResumen.forEach((item: any) => {
        const index = fields.findIndex((f: any) => {
          const fieldValues = watch(`variantes`);
          const currentField = fieldValues[fields.indexOf(f)];
          return currentField?.sku === item.sku || 
                 (currentField?.color === item.color && currentField?.talla === item.talla);
        });

        if (index !== -1) {
          // Usamos 'stock' directamente como viene de tu CSV/DB
          setValue(`variantes.${index}.stock`, item.stock ?? 0);
        }
      });
    }
  }, [stockResumen, fields, setValue, watch]);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Variantes de Inventario</h3>
        </div>
        <Button
          type="button"
          onClick={() => append({ color: "", talla: "", stock: 0, sku: "" })}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 h-9 text-xs font-bold gap-2"
        >
          <Plus size={14} /> Agregar variante
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Color</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Talla</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU Variante</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
              <th className="px-6 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fields.map((field, index) => {
              const color = watch(`variantes.${index}.color`) || "";
              const talla = watch(`variantes.${index}.talla`) || "";
              const currentStock = watch(`variantes.${index}.stock`);
              
              const generatedSKU = (color && talla && skuMaestro !== "SKU") 
                ? generateVariantSKU(skuMaestro, color, talla) 
                : watch(`variantes.${index}.sku`) || "---";

              return (
                <tr key={field.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3 text-center">
                     <Input 
                      {...register(`variantes.${index}.color`)} 
                      className="h-11 bg-gray-50/50 border-gray-100 rounded-xl font-semibold text-gray-700" 
                    />
                  </td>
                  <td className="px-4 py-3 w-28 text-center">
                    <Input 
                      {...register(`variantes.${index}.talla`)} 
                      className="h-11 bg-gray-50/50 border-gray-100 rounded-xl text-center font-bold uppercase" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 px-3 h-11 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-[11px] font-mono text-gray-400">
                      <Fingerprint size={12} />
                      <span>{generatedSKU}</span>
                      <input type="hidden" {...register(`variantes.${index}.sku`)} value={generatedSKU} />
                    </div>
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className={`flex items-center justify-center gap-2 h-11 border rounded-xl font-black text-sm ${
                      Number(currentStock) > 0 ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-red-50 border-red-100 text-red-500"
                    }`}>
                      <Box size={14} />
                      {currentStock ?? 0}
                    </div>
                    {/* REGISTRO ÚNICO COMO 'stock' */}
                    <input type="hidden" {...register(`variantes.${index}.stock`)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(index)} className="p-2 text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
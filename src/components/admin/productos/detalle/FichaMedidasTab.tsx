"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CELL = "h-9 bg-transparent border-none text-sm font-medium text-gray-700 focus-visible:ring-1 focus-visible:ring-pink-200 placeholder:text-gray-300 rounded-lg text-center";

interface Medida {
  id?:          string;
  punto_medida: string;
  talla:        string;
  valor_cm:     number | "";
  tolerancia:   number | "";
}

interface FichaMedidasTabProps {
  fichaId:          string | null;
  medidasIniciales: any[];
  canEdit:          boolean;
}

export function FichaMedidasTab({ fichaId, medidasIniciales, canEdit }: FichaMedidasTabProps) {
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit } = useForm<{ medidas: Medida[] }>({
    defaultValues: {
      medidas: medidasIniciales.length > 0
        ? medidasIniciales.map((m: any) => ({
            id:           m.id,
            punto_medida: m.punto_medida ?? "",
            talla:        m.talla        ?? "",
            valor_cm:     m.valor_cm     ?? "",
            tolerancia:   m.tolerancia   ?? "",
          }))
        : [{ punto_medida: "", talla: "", valor_cm: "", tolerancia: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "medidas" });

  const onSubmit = async (data: { medidas: Medida[] }) => {
    if (!fichaId) {
      toast.error("Primero debes crear la ficha técnica en el tab anterior.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ficha-medidas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ficha_id: fichaId,
          medidas:  data.medidas.map(m => ({
            punto_medida: m.punto_medida,
            talla:        m.talla,
            valor_cm:     m.valor_cm     !== "" ? Number(m.valor_cm)   : null,
            tolerancia:   m.tolerancia   !== "" ? Number(m.tolerancia) : null,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Medidas guardadas correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!fichaId) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center space-y-3">
        <AlertCircle className="mx-auto text-amber-400" size={32} />
        <p className="text-sm font-bold text-gray-700">Sin ficha técnica</p>
        <p className="text-xs text-gray-400">
          Ve al tab <span className="font-bold text-pink-600">Ficha técnica</span> y crea la ficha primero.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
              Tabla de medidas
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Puntos de medida por talla con tolerancias
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!canEdit && (
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase">
              <Lock size={12} /> Solo lectura
            </span>
          )}
          {canEdit && (
            <Button
              type="button"
              onClick={() => append({ punto_medida: "", talla: "", valor_cm: "", tolerancia: "" })}
              className="bg-gray-900 hover:bg-gray-700 text-white h-8 px-3 rounded-lg font-bold text-xs gap-1.5"
            >
              <Plus size={13} /> Agregar fila
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Punto de medida", "Talla", "Valor (cm)", "Tolerancia (cm)", ""].map(h => (
                  <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fields.map((field, index) => (
                <tr key={field.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-1.5">
                    <Input
                      {...register(`medidas.${index}.punto_medida` as const, { required: true })}
                      disabled={!canEdit}
                      placeholder="Ej. Pecho"
                      className={CELL}
                    />
                  </td>
                  <td className="px-3 py-1.5 w-24">
                    <Input
                      {...register(`medidas.${index}.talla` as const, { required: true })}
                      disabled={!canEdit}
                      placeholder="M"
                      className={CELL}
                    />
                  </td>
                  <td className="px-3 py-1.5 w-28">
                    <Input
                      type="number"
                      step="0.1"
                      {...register(`medidas.${index}.valor_cm` as const)}
                      disabled={!canEdit}
                      placeholder="0.0"
                      className={CELL}
                    />
                  </td>
                  <td className="px-3 py-1.5 w-32">
                    <Input
                      type="number"
                      step="0.1"
                      {...register(`medidas.${index}.tolerancia` as const)}
                      disabled={!canEdit}
                      placeholder="±0.5"
                      className={CELL}
                    />
                  </td>
                  <td className="px-3 py-1.5 w-10 text-right">
                    {canEdit && fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Total filas: <span className="text-blue-600 font-black">{fields.length}</span>
            </span>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-bold gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Save size={15} /> Guardar medidas</>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
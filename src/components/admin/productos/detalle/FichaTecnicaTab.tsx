// src/components/admin/productos/detalle/FichaTecnicaTab.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, Loader2, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELD_LABEL = "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT  = "bg-gray-50 border-gray-200 h-11 rounded-lg text-sm font-medium text-gray-800 focus-visible:ring-2 focus-visible:ring-pink-300 transition-all placeholder:text-gray-300";

interface FichaTecnicaTabProps {
  producto:     any;
  fichaInicial: any | null;
  canEdit:      boolean;
}

export function FichaTecnicaTab({ producto, fichaInicial, canEdit }: FichaTecnicaTabProps) {
  const [loading, setLoading]   = useState(false);
  const [ficha,   setFicha]     = useState(fichaInicial);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      version:               ficha?.version               ?? "1.0",
      descripcion_detallada: ficha?.descripcion_detallada ?? "",
      sam_total:             ficha?.sam_total             ?? "",
      costo_estimado:        ficha?.costo_estimado        ?? "",
      ficha_url:             ficha?.ficha_url             ?? "",
      imagen_geometral:      ficha?.imagen_geometral      ?? "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const isCreate = !ficha?.id;
      const url    = "/api/admin/fichas-tecnicas";
      const method = isCreate ? "POST" : "PUT";
      const body   = isCreate
        ? { producto_id: producto.id, ...data }
        : { id: ficha.id,             ...data };

      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setFicha(result.data);
      toast.success(isCreate ? "Ficha creada correctamente" : "Ficha actualizada correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
              Ficha técnica de producción
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {ficha?.id ? `Versión ${ficha.version} · ${ficha.estado}` : "Sin ficha registrada"}
            </p>
          </div>
        </div>
        {!canEdit && (
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase">
            <Lock size={12} /> Solo lectura
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">

          {/* Descripción */}
          <div className="col-span-2">
            <Label className={FIELD_LABEL}>Descripción detallada</Label>
            <Textarea
              {...register("descripcion_detallada")}
              disabled={!canEdit}
              className="bg-gray-50 border-gray-200 rounded-lg text-sm min-h-[100px] focus-visible:ring-2 focus-visible:ring-pink-300 disabled:opacity-60"
              placeholder="Detalles de confección, materiales y acabados..."
            />
          </div>

          {/* SAM */}
          <div>
            <Label className={FIELD_LABEL}>SAM total (minutos)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("sam_total")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="Ej. 12.5"
            />
          </div>

          {/* Costo estimado */}
          <div>
            <Label className={FIELD_LABEL}>Costo estimado (S/.)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("costo_estimado")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="0.00"
            />
          </div>

          {/* Versión */}
          <div>
            <Label className={FIELD_LABEL}>Versión</Label>
            <Input
              {...register("version")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="1.0"
            />
          </div>

          {/* URL Ficha PDF */}
          <div>
            <Label className={FIELD_LABEL}>URL Ficha PDF</Label>
            <Input
              {...register("ficha_url")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="https://..."
            />
          </div>

          {/* Imagen geometral */}
          <div className="col-span-2">
            <Label className={FIELD_LABEL}>URL imagen geometral</Label>
            <Input
              {...register("imagen_geometral")}
              disabled={!canEdit}
              className={FIELD_INPUT}
              placeholder="https://..."
            />
          </div>

          {/* Preview imagen geometral */}
          {ficha?.imagen_geometral && (
            <div className="col-span-2">
              <Label className={FIELD_LABEL}>Vista previa geometral</Label>
              <img
                src={ficha.imagen_geometral}
                alt="Imagen geometral"
                className="rounded-lg border border-gray-100 max-h-48 object-contain bg-gray-50 p-2"
              />
            </div>
          )}

          {/* Preview PDF */}
          {ficha?.ficha_url && (
            <div className="col-span-2">
                href={ficha.ficha_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 transition-colors"
                <FileText size={14} />
                Ver ficha técnica PDF
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 font-bold gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Save size={15} /> {ficha?.id ? "Guardar cambios" : "Crear ficha"}</>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
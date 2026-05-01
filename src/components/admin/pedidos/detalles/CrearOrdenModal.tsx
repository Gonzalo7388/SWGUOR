"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, Factory, Loader2, Save } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const FIELD_LABEL = "text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-1.5";
const FIELD_INPUT = "bg-gray-50 border-gray-200 h-10 rounded-lg text-sm font-medium text-gray-700 focus-visible:ring-2 focus-visible:ring-pink-300";

interface CrearOrdenModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  pedido:    any;
  talleres:  any[];
  onSuccess: (orden: any) => void;
}

export function CrearOrdenModal({ isOpen, onClose, pedido, talleres, onSuccess }: CrearOrdenModalProps) {
  const [loading, setLoading] = useState(false);

  // Items del pedido que tienen ficha técnica
  const itemsConFicha = (pedido.items ?? []).filter(
    (item: any) => item.productos?.fichas_tecnicas_id
  );

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      producto_id:         "",
      taller_id:           "",
      cantidad_solicitada: pedido.total_unidades ?? "",
      fecha_entrega:       "",
      notas:               "",
    },
  });

  const productoSeleccionado = watch("producto_id");
  const itemSeleccionado     = itemsConFicha.find(
    (item: any) => item.productos?.id?.toString() === productoSeleccionado
  );
  const fichaId = itemSeleccionado?.productos?.fichas_tecnicas_id;

  const onSubmit = async (data: any) => {
    if (!fichaId) {
      toast.error("El producto seleccionado no tiene ficha técnica. Créala primero.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ordenes-produccion", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          producto_id:         data.producto_id,
          taller_id:           data.taller_id,
          ficha_id:            fichaId,
          cantidad_solicitada: data.cantidad_solicitada,
          fecha_entrega:       data.fecha_entrega || null,
          notas:               data.notas || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Orden de producción creada");
      reset();
      onSuccess(result.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Factory className="text-white w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Nueva orden de producción
              </h3>
              <p className="text-[11px] text-gray-400">Pedido #{pedido.id}</p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onClose(); }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Producto */}
          <div>
            <Label className={FIELD_LABEL}>Producto del pedido</Label>
            {itemsConFicha.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs font-bold text-amber-700">
                Ningún producto del pedido tiene ficha técnica. Créalas primero en el módulo de productos.
              </div>
            ) : (
              <select
                {...register("producto_id", { required: "Selecciona un producto" })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="">Seleccionar producto...</option>
                {itemsConFicha.map((item: any) => (
                  <option key={item.id} value={item.productos?.id}>
                    {item.productos?.nombre} — {item.variantes_producto?.color} / {item.variantes_producto?.talla}
                  </option>
                ))}
              </select>
            )}
            {errors.producto_id && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.producto_id.message as string}</p>
            )}
          </div>

          {/* Ficha detectada */}
          {fichaId && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 text-xs font-bold text-emerald-700">
              Ficha técnica detectada automáticamente
            </div>
          )}

          {/* Taller */}
          <div>
            <Label className={FIELD_LABEL}>Taller</Label>
            <select
              {...register("taller_id", { required: "Selecciona un taller" })}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="">Seleccionar taller...</option>
              {talleres.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.especialidad ? `· ${t.especialidad}` : ""}
                </option>
              ))}
            </select>
            {errors.taller_id && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.taller_id.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cantidad */}
            <div>
              <Label className={FIELD_LABEL}>Cantidad solicitada</Label>
              <Input
                type="number"
                min={1}
                {...register("cantidad_solicitada", { required: true, min: 1 })}
                className={FIELD_INPUT}
              />
            </div>

            {/* Fecha entrega */}
            <div>
              <Label className={FIELD_LABEL}>Fecha de entrega</Label>
              <Input
                type="date"
                {...register("fecha_entrega")}
                className={FIELD_INPUT}
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label className={FIELD_LABEL}>Notas</Label>
            <textarea
              {...register("notas")}
              placeholder="Instrucciones especiales para el taller..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[70px] resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onClose(); }}
              className="h-9 px-4 font-semibold border-gray-200 text-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || itemsConFicha.length === 0}
              className="bg-pink-600 hover:bg-pink-700 text-white h-9 px-5 font-bold gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Save size={14} /> Crear orden</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
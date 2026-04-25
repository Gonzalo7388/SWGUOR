"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordenProduccionSchema, OrdenProduccionFormValues } from "@/lib/schemas/ordenes-produccion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { useEffect } from "react";
import { Factory, Hash, Layers, CalendarClock, AlignLeft, Loader2, Plus, Save } from "lucide-react";

// ─── Estilos ERP consistentes ────────────────────────────────
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";
const ERP_ERROR = "text-[11px] text-rose-500 font-semibold mt-1";

export default function OrdenFormDialog({ open, onClose, initialData }: any) {
  const { create, update, isCreating, isUpdating } = useOrdenesProduccion();
  const isEditing = !!initialData;
  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrdenProduccionFormValues>({
    resolver: zodResolver(ordenProduccionSchema),
    defaultValues: initialData || { cantidad_solicitada: 1 },
  });

  useEffect(() => { if (initialData) reset(initialData); }, [initialData, reset]);

  const onSubmit = (data: OrdenProduccionFormValues) => {
    if (isEditing) {
      update(initialData.id, data);
    } else {
      create(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">

        {/* ── Cabecera ─────────────────────────────────────── */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl shrink-0">
            <Factory className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              {isEditing ? "Editar Orden" : "Nueva Orden de Producción"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              {isEditing
                ? "Modifica los datos de la orden seleccionada."
                : "Registra una nueva orden para un taller asignado."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">

          {/* ── Fila 1: Producto + Taller ─────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={ERP_LABEL}>
                <Hash className="w-3.5 h-3.5" /> ID Producto
              </Label>
              <Input
                type="number"
                {...register("producto_id", { valueAsNumber: true })}
                placeholder="Ej: 10"
                className={ERP_INPUT}
              />
              {errors.producto_id && <p className={ERP_ERROR}>{errors.producto_id.message}</p>}
            </div>
            <div>
              <Label className={ERP_LABEL}>
                <Layers className="w-3.5 h-3.5" /> ID Taller
              </Label>
              <Input
                type="number"
                {...register("taller_id", { valueAsNumber: true })}
                placeholder="Ej: 3"
                className={ERP_INPUT}
              />
              {errors.taller_id && <p className={ERP_ERROR}>{errors.taller_id.message}</p>}
            </div>
          </div>

          {/* ── Fila 2: Ficha + Pedido ────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={ERP_LABEL}>
                <Hash className="w-3.5 h-3.5" /> ID Ficha Técnica
              </Label>
              <Input
                type="number"
                {...register("ficha_id", { valueAsNumber: true })}
                placeholder="Ej: 2"
                className={ERP_INPUT}
              />
              {errors.ficha_id && <p className={ERP_ERROR}>{errors.ficha_id.message}</p>}
            </div>
            <div>
              <Label className={ERP_LABEL}>
                <Hash className="w-3.5 h-3.5" /> ID Pedido
              </Label>
              <Input
                type="number"
                {...register("pedido_id", { valueAsNumber: true })}
                placeholder="Ej: 5"
                className={ERP_INPUT}
              />
              {errors.pedido_id && <p className={ERP_ERROR}>{errors.pedido_id.message}</p>}
            </div>
          </div>

          {/* ── Fila 3: Cantidad + Fecha ──────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={ERP_LABEL}>
                <Layers className="w-3.5 h-3.5" /> Cantidad solicitada
              </Label>
              <Input
                type="number"
                {...register("cantidad_solicitada", { valueAsNumber: true })}
                placeholder="Ej: 400"
                className={ERP_INPUT}
              />
              {errors.cantidad_solicitada && <p className={ERP_ERROR}>{errors.cantidad_solicitada.message}</p>}
            </div>
            <div>
              <Label className={ERP_LABEL}>
                <CalendarClock className="w-3.5 h-3.5" /> Fecha de entrega
              </Label>
              <Input
                type="date"
                {...register("fecha_entrega")}
                className={ERP_INPUT}
              />
            </div>
          </div>

          {/* ── Notas ────────────────────────────────────── */}
          <div>
            <Label className={ERP_LABEL}>
              <AlignLeft className="w-3.5 h-3.5" /> Notas adicionales
            </Label>
            <Input
              {...register("notas")}
              placeholder="Ej: Usar hilo palo rosa, acabado mate..."
              className={ERP_INPUT}
            />
          </div>

          {/* ── Footer ───────────────────────────────────── */}
          <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-8 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditing ? "Guardar Cambios" : "Crear Orden"}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
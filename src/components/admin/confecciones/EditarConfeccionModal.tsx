"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfeccionForm } from "./ConfeccionForm";
import { confeccionOutputSchema } from "@/lib/schemas/confecciones";
import type { ConfeccionFormValues } from "@/lib/schemas/confecciones";
import { toast } from "sonner";
import type { ConfeccionRow_T } from "./ConfeccionesTable";
import { Loader2 } from "lucide-react";

interface EditarConfeccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orden: ConfeccionRow_T | null;
  talleres: { id: string | number; nombre: string }[];
  onSuccess: () => void;
}

export function EditarConfeccionModal({
  open,
  onOpenChange,
  orden,
  talleres,
  onSuccess,
}: EditarConfeccionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<ConfeccionFormValues | null>(null);

  useEffect(() => {
    if (orden && open) {
      setFormValues({
        orden_produccion_id: orden.ordenes_produccion?.id
          ? Number(orden.ordenes_produccion.id)
          : undefined,
        taller_id: orden.talleres?.id?.toString() || "",
        prenda: orden.prenda,
        cantidad: orden.cantidad,
        costo_unitario: orden.costo_unitario ?? undefined,
        prioridad: orden.prioridad,
        estado: orden.estado,
        fecha_entrega: orden.fecha_entrega || "",
        notas: "",
      });
    }
  }, [orden, open]);

  const handleSubmit = async (values: ConfeccionFormValues) => {
    if (!orden) return;

    setIsLoading(true);
    try {
      const payload = confeccionOutputSchema.parse(values);

      const res = await fetch(`/api/admin/confecciones/${orden.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al actualizar la orden");
      }

      toast.success("Orden actualizada correctamente");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white [&>button]:text-black [&>button]:hover:text-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase italic text-pink-600">
            Editar Orden #{orden?.id}
          </DialogTitle>
        </DialogHeader>

        {!formValues ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        ) : (
          <ConfeccionForm
            talleres={talleres}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultValues={formValues}
            isEditing={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
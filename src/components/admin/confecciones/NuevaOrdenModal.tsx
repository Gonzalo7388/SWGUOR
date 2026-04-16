"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ConfeccionForm }       from "./ConfeccionForm";
import { confeccionOutputSchema } from "@/lib/schemas/confecciones";
import type { ConfeccionFormValues } from "@/lib/schemas/confecciones";
import { toast } from "sonner";

interface NuevaOrdenModalProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  talleres:     { id: string | number; nombre: string }[];
  pedidoId?:    number;   // si se abre desde un pedido específico
  onSuccess:    () => void;
}

export function NuevaOrdenModal({
  open, onOpenChange, talleres, pedidoId, onSuccess,
}: NuevaOrdenModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: ConfeccionFormValues) {
    setIsLoading(true);
    try {
      // Transformar con el output schema (convierte fecha, taller_id)
      const payload = confeccionOutputSchema.parse(values);

      const res = await fetch("/api/admin/confecciones", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...payload,
          // Si el modal se abre desde un pedido, sobreescribir pedido_id
          ...(pedidoId ? { pedido_id: pedidoId } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al crear la orden");
      }

      toast.success("Orden de producción creada");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase italic">
            Nueva Orden de Confección
          </DialogTitle>
          <DialogDescription>
            Completa los datos para generar la orden de producción con el taller.
          </DialogDescription>
        </DialogHeader>

        <ConfeccionForm
          talleres={talleres}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          defaultPedidoId={pedidoId}
        />
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TallerForm, { TallerFormValues } from "./TallerForm";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";

interface CreateTallerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTallerDialog({ isOpen, onClose, onSuccess }: CreateTallerDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleCreate = async (values: TallerFormValues) => {
    setLoading(true);
    try {
      // 1. Validar si el RUC ya existe antes de insertar
      const { data: existing } = await supabase
        .from("talleres")
        .select("ruc")
        .eq("ruc", values.ruc)
        .maybeSingle();

      if (existing) {
        toast.error(`El RUC ${values.ruc} ya está registrado en otro taller`);
        setLoading(false);
        return;
      }

      // 2. Insertar el nuevo taller
      const { error } = await supabase
        .from("talleres")
        .insert([values]);

      if (error) throw error;

      toast.success("Taller registrado exitosamente");
      onSuccess(); // Refresca la tabla principal
      onClose();   // Cierra el modal
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el taller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold italic text-pink-600">
            Registrar Nuevo Taller
          </DialogTitle>
        </DialogHeader>
        
        <TallerForm 
          onSubmit={handleCreate} 
          isLoading={loading} 
        />
      </DialogContent>
    </Dialog>
  );
}
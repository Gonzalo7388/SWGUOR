"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function EditTallerDialog({ isOpen, onClose, taller, onSuccess }: any) {
  const supabase = getSupabaseBrowserClient();

  type EstadoTaller = "activo" | "inactivo" | "suspendido";

  const [form, setForm] = useState<{
    nombre: string;
    ruc: string;
    contacto: string;
    estado: EstadoTaller;
  }>({
    nombre: "",
    ruc: "",
    contacto: "",
    estado: "activo"
  });

  useEffect(() => {
    if (taller) {
      setForm({
        nombre: taller.nombre || "",
        ruc: taller.ruc || "",
        contacto: taller.contacto || "",
        estado: taller.estado || "activo"
      });
    }
  }, [taller]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("talleres")
        .update(form)
        .eq("id", taller.id);

      if (error) throw error;

      toast.success("Taller actualizado correctamente");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Error al actualizar taller");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Taller</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
          <Input name="ruc" value={form.ruc} onChange={handleChange} placeholder="RUC" />
          <Input name="contacto" value={form.contacto} onChange={handleChange} placeholder="Contacto" />
          <Input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" />

          <Button onClick={handleUpdate} className="text-pink-600">
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
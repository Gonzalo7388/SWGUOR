"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import QuickFormDialog, { QuickField } from "@/components/admin/common/QuickFormDialog";

export default function CreateCategoriaDialog({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          activo: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al crear");

      toast.success("Categoría registrada correctamente");
      setNombre("");
      setDescripcion("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "No se pudo crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre("");
      setDescripcion("");
      onClose();
    }
  };

  return (
    <QuickFormDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Categoría"
      description="Define una nueva línea para tus productos"
      primaryColor="pink"
      submitLabel="Crear Categoría"
      isLoading={loading}
      onSubmit={handleSubmit}
    >
      <QuickField label="Nombre de la Línea">
        <Input
          placeholder="Ej. Vestidos de Gala"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={loading}
          className="bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-10 text-sm"
          required
        />
      </QuickField>

      <QuickField label="Descripción">
        <Textarea
          placeholder="¿Qué tipo de prendas incluye esta categoría?"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={loading}
          className="bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all text-sm resize-none"
          rows={3}
        />
      </QuickField>
    </QuickFormDialog>
  );
}
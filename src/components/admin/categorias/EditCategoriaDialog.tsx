"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Layers, Edit3, Power, AlignLeft, X } from "lucide-react";

const ERP_LABEL =
  "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT =
  "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

interface EditCategoriaDialogProps {
  isOpen: boolean;
  categoria: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoriaDialog({
  isOpen,
  categoria,
  onClose,
  onSuccess,
}: EditCategoriaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  useEffect(() => {
    if (categoria && isOpen) {
      setFormData({
        nombre: categoria.nombre || "",
        descripcion: categoria.descripcion || "",
        activo: categoria.activo ?? true,
      });
    }
  }, [isOpen, categoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre es obligatorio");

    setLoading(true);
    try {
      const payload = {
        id: categoria.id,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion || null,
        activo: formData.activo,
      };

      const response = await fetch("/api/admin/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al actualizar");

      toast.success("Categoría actualizada correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>

        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/*
          Usamos el primitivo de Radix directamente para tener control total del DOM.
          overflow-hidden + rounded-[28px] aquí garantizan que la franja
          (primer hijo) quede recortada por las esquinas redondeadas del modal.
        */}
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-none overflow-hidden shadow-2xl border-0 outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >

          {/* ── FRANJA — primer nodo hijo, sin margin ni padding encima ── */}
          <div
            style={{
              height: "5px",
              width: "100%",
              background: "linear-gradient(90deg, #ec4899 0%, #e11d48 55%, #f43f5e 100%)",
            }}
          />

          {/* ── Resto del contenido ── */}
          <div className="px-8 pt-7 pb-8">

            {/* Botón cerrar */}
            <DialogPrimitive.Close className="absolute right-5 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>

            {/* CABECERA */}
            <div className="flex items-center gap-4 pr-8 mb-6">
              <div className="p-3 bg-[#fff0f6] rounded-2xl shrink-0">
                <Layers className="w-7 h-7 text-[#e32d6f]" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight leading-tight">
                  Editar Categoría
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-slate-400 text-[13px] font-medium mt-0.5">
                  Ajusta la visibilidad y detalles de la línea.
                </DialogPrimitive.Description>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* NOMBRE */}
              <div className="space-y-1">
                <Label className={ERP_LABEL}>
                  <Edit3 className="w-3.5 h-3.5" /> Nombre de la Línea
                </Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className={ERP_INPUT}
                  placeholder="Ej. Colección Verano"
                  required
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-1">
                <Label className={ERP_LABEL}>
                  <AlignLeft className="w-3.5 h-3.5" /> Notas Internas
                </Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className={`${ERP_INPUT} min-h-[100px] py-3 resize-none h-auto`}
                  placeholder="Descripción opcional..."
                />
              </div>

              {/* ESTADO */}
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      formData.activo ? "bg-green-100" : "bg-slate-200"
                    }`}
                  >
                    <Power
                      className={`w-4 h-4 ${
                        formData.activo ? "text-green-600" : "text-slate-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Estado Actual
                    </p>
                    <p className="text-sm font-bold text-[#1a2b4b]">
                      {formData.activo ? "Visible en Catálogo" : "Oculta al Público"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.activo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, activo: checked })
                  }
                  className="data-[state=checked]:bg-[#e32d6f]"
                />
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-end gap-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-10 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
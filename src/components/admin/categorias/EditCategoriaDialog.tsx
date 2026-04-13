"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Layers, Edit3 } from "lucide-react";

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
  onSuccess 
}: EditCategoriaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  // Sincronizar datos cuando el modal se abre con una categoría específica
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
    
    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setLoading(true);

    const payload = {
      id: categoria.id,
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion || null,
      activo: formData.activo,
    };

    try {
      const response = await fetch('/api/admin/categorias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al actualizar");

      toast.success("Categoría actualizada con éxito");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(error.message || "No se pudo actualizar la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
        
        {/* Header Estilo GUOR (Pink) */}
        <div className="bg-pink-600 p-6 text-white relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
                Editar Categoría
              </DialogTitle>
            </div>
            <DialogDescription className="text-pink-100 font-medium">
              Modifica los detalles generales de la línea de productos.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* Campo: Nombre */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Edit3 className="w-3 h-3 text-pink-500" /> Nombre de la Línea
              </Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white h-12 transition-all font-bold text-slate-700 focus:ring-pink-500"
                required
                placeholder="Ej. Casacas, Vestidos..."
              />
            </div>

            {/* Campo: Descripción */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Descripción Adicional
              </Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="rounded-2xl border-slate-200 bg-slate-50 focus:bg-white resize-none min-h-[100px] transition-all text-sm focus:ring-pink-500"
                placeholder="Notas sobre esta línea de productos..."
              />
            </div>

            {/* Switch de Estado (Panel Destacado) */}
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-inner">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Disponibilidad</p>
                <p className="text-xs font-bold">
                  {formData.activo ? "Visible en Catálogo" : "Oculta al Cliente"}
                </p>
              </div>
              <Switch
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                className="data-[state=checked]:bg-pink-500"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Descartar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-pink-100 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> 
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
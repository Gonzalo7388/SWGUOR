"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Layers, Edit3, Power, AlignLeft } from "lucide-react";

// Estilos constantes para coherencia visual
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

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

      const response = await fetch('/api/admin/categorias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* CABECERA ESTILO ERP */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <Layers className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Editar Categoría
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Ajusta la visibilidad y detalles de la línea.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          
          {/* NOMBRE DE LA CATEGORÍA */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Edit3 className="w-3.5 h-3.5" /> Nombre de la Línea
            </Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className={`${ERP_INPUT} min-h-[100px] py-3 resize-none`}
              placeholder="Descripción opcional..."
            />
          </div>

          {/* ESTADO DE VISIBILIDAD (SWITCH REDISEÑADO) */}
          <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${formData.activo ? 'bg-green-100' : 'bg-slate-200'}`}>
                <Power className={`w-4 h-4 ${formData.activo ? 'text-green-600' : 'text-slate-500'}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</p>
                <p className="text-sm font-bold text-[#1a2b4b]">
                  {formData.activo ? "Visible en Catálogo" : "Oculta al Público"}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              className="data-[state=checked]:bg-[#e32d6f]"
            />
          </div>

          {/* ACCIONES FOOTER */}
          <div className="flex items-center justify-end gap-6 pt-6 mt-2 border-t border-slate-50">
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
      </DialogContent>
    </Dialog>
  );
}
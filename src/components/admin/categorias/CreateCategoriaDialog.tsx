"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Layers, Tag, AlignLeft, Loader2, Plus } from "lucide-react";

// Estilos constantes para mantener coherencia con el resto del ERP
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

export default function CreateCategoriaDialog({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const categoriaData = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      activo: true
    };

    try {
      const response = await fetch('/api/admin/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al crear");

      toast.success("Categoría registrada correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "No se pudo crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* CABECERA */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <Layers className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Nueva Categoría
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Define una nueva línea para tus productos.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          
          {/* NOMBRE DE LA CATEGORÍA */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Tag className="w-3.5 h-3.5" /> Nombre de la Línea
            </Label>
            <Input 
              name="nombre" 
              placeholder="Ej. Vestidos de Gala" 
              required 
              className={ERP_INPUT}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <AlignLeft className="w-3.5 h-3.5" /> Descripción de Línea
            </Label>
            <Textarea 
              name="descripcion" 
              placeholder="¿Qué tipo de prendas incluye esta categoría?" 
              className={`${ERP_INPUT} min-h-[100px] py-3 resize-none`}
            />
          </div>

          {/* ACCIONES FOOTER */}
          <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-8 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Crear Categoría</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
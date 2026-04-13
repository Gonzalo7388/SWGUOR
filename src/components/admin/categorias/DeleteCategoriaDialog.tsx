"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogTitle,
  DialogHeader 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteCategoriaDialogProps {
  isOpen: boolean;
  categoria: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCategoriaDialog({ 
  isOpen, 
  categoria, 
  onClose, 
  onSuccess 
}: DeleteCategoriaDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!categoria?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/categorias?id=${categoria.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se puede eliminar la categoría");
      }

      toast.success("Categoría eliminada con éxito");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      toast.error(error.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[28px] shadow-2xl bg-white">
        {/* Banner rojo superior - Identidad visual de eliminación */}
        <div className="h-2 bg-red-600 w-full" />

        <div className="p-8 space-y-6">
          {/* Header con icono y títulos */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-2xl flex-shrink-0">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                Eliminar Categoría
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Acción Irreversible
              </DialogDescription>
            </div>
          </div>

          {/* Mensaje de advertencia estilizado */}
          <div className="bg-red-50 border border-red-100 rounded-[20px] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  ¿Estás seguro de eliminar la categoría{" "}
                  <span className="font-black text-red-600 underline decoration-2">
                    {categoria?.nombre || "seleccionada"}
                  </span>?
                </p>
                
                <div className="bg-white/50 p-3 rounded-xl border border-red-100/50">
                  <p className="text-[11px] text-red-700 font-bold leading-tight italic">
                    Nota: El sistema no permitirá la eliminación si existen productos vinculados a esta categoría.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de acciones */}
          <DialogFooter className="flex flex-row gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Mantener
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Baja"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
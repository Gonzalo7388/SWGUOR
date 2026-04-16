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

interface DeleteProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto: any;
}

export default function DeleteProductoDialog({
  isOpen,
  onClose,
  onSuccess,
  producto,
}: DeleteProductoDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!producto?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/productos?id=${producto.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error || "No se pudo eliminar el producto");

      toast.success("Producto eliminado del catálogo correctamente");
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
          {/* Header con icono y títulos al estilo de los anteriores */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-2xl flex-shrink-0">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                Eliminar Producto
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Catálogo GUOR • Acción Permanente
              </DialogDescription>
            </div>
          </div>

          {/* Mensaje de advertencia estilizado */}
          <div className="bg-red-50 border border-red-100 rounded-[20px] p-5">
            <div className="flex gap-4 items-start">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-red-100 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">
                  Confirmación Requerida
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  ¿Estás seguro de que deseas retirar{" "}
                  <span className="font-black text-slate-900 underline decoration-red-200 decoration-2 underline-offset-2">
                    {producto?.nombre || "este producto"}
                  </span>{" "}
                  del catálogo activo? Esta acción borrará sus datos permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Footer de acciones unificado */}
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
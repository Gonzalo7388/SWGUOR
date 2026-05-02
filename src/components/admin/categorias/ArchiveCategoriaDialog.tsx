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
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react";

interface DescontinuarCategoriaDialogProps {
  isOpen:    boolean;
  categoria: any;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function DescontinuarCategoriaDialog({
  isOpen,
  categoria,
  onClose,
  onSuccess
}: DescontinuarCategoriaDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDescontinuar = async () => {
    if (!categoria?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/categorias/${categoria.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: "inactivo" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo descontinuar la categoría");
      }

      toast.success("Categoría descontinuada correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al descontinuar:", error);
      toast.error(error.message || "Error al descontinuar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[28px] shadow-2xl bg-white">
        {/* Franja superior coloreada - Borde Visual */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 w-full" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl flex-shrink-0">
              <ShieldOff className="w-7 h-7 text-amber-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                Descontinuar Categoría
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                La categoría quedará inactiva
              </DialogDescription>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  ¿Estás seguro de descontinuar la categoría{" "}
                  <span className="font-black text-amber-600 underline decoration-2">
                    {categoria?.nombre || "seleccionada"}
                  </span>?
                </p>
                <div className="bg-white/50 p-3 rounded-xl border border-amber-100/50">
                  <p className="text-[11px] text-amber-700 font-bold leading-tight italic">
                    La categoría pasará a estado inactivo y no aparecerá en el catálogo.
                    Los productos vinculados no serán afectados. Puedes reactivarla en cualquier momento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <DialogFooter className="flex flex-row gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDescontinuar}
              disabled={loading}
              className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-amber-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Descontinuar"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
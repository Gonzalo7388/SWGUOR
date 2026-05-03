"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react"; 
import { tienePermiso, type RolUsuario } from "@/lib/constants/roles";

interface DescontinuarProductoDialogProps { 
  isOpen:     boolean;
  onClose:    () => void;
  onSuccess:  () => void;
  producto:   any;
  rolUsuario: RolUsuario;
}

export default function DescontinuarProductoDialog({ 
  isOpen,
  onClose,
  onSuccess,
  producto,
  rolUsuario,
}: DescontinuarProductoDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!tienePermiso(rolUsuario, 'descontinuar_productos')) return null;

  const handleDescontinuar = async () => {
    if (!producto?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/productos?id=${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "inactivo" }),
      });

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error || "No se pudo descontinuar el producto");

      toast.success("Producto descontinuado correctamente");
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
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[28px] shadow-2xl bg-guor-cream">
        <div className="h-2 bg-amber-500 w-full" /> 

        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl flex-shrink-0">
              <ShieldOff className="w-7 h-7 text-amber-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-guor-dark tracking-tight">
                Descontinuar Producto
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-guor-gold/70 uppercase tracking-[0.2em]">
                El producto quedará inactivo
              </DialogDescription>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-[20px] p-5">
            <div className="flex gap-4 items-start">
              <div className="bg-guor-cream p-2 rounded-xl shadow-sm border border-amber-100 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                  Confirmación Requerida
                </p>
                <p className="text-sm text-guor-dark/80 leading-relaxed">
                  ¿Estás seguro de descontinuar{" "}
                  <span className="font-black text-amber-600 underline decoration-2">
                    {producto?.nombre || "este producto"}
                  </span>?
                </p>
                <p className="text-[11px] text-amber-700 font-bold leading-tight italic mt-2">
                  El producto pasará a estado inactivo y no aparecerá en el catálogo.
                  Puedes reactivarlo en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-guor-gold hover:bg-guor-cream/60 transition-all"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDescontinuar}
              disabled={loading}
              className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-amber-100 transition-all active:scale-95 disabled:opacity-60"
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
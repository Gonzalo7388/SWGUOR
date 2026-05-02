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
import { XCircle, Loader2, AlertTriangle } from "lucide-react";

export default function CancelPedidoDialog({ isOpen, pedido, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pedidos?id=${pedido.id}`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al anular");

      toast.success("Pedido anulado y stock restaurado");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "No se pudo anular el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[28px] shadow-2xl">
        {/* Banner rojo superior - Identidad visual de borrado/anulación */}
        <div className="h-2 bg-red-600 w-full" />

        <div className="p-8 space-y-6">
          {/* Header con icono y títulos */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-2xl flex-shrink-0">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                Anular Pedido
              </DialogTitle>
              <DialogDescription className="text-sm font-bold text-pink-600 uppercase tracking-widest">
                Folio: #{pedido?.id?.toString().slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
          </div>

          {/* Mensaje de advertencia estilo DeleteUsuario */}
          <div className="bg-red-50 border border-red-100 rounded-[20px] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 leading-relaxed">
                ¿Estás seguro que deseas anular la venta de{" "}
                <span className="font-black text-red-600">
                  {pedido?.clientes?.razon_social || "este cliente"}
                </span>? 
                <br /><br />
                Esta acción cambiará el estado a <span className="font-bold underline">CANCELADO</span> y los productos regresarán automáticamente al inventario.
              </p>
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
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Anulación"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
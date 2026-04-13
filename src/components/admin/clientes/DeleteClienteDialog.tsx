"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react"; 

export default function DeleteClienteDialog({ isOpen, onClose, cliente, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // LLAMADA A TU API USANDO EL MÉTODO DELETE Y PASANDO EL ID EN LA URL
      const response = await fetch(`/api/admin/clientes?id=${cliente.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "No se pudo eliminar");

      toast.success("Cliente eliminado del sistema");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="max-w-md bg-white rounded-3xl overflow-hidden p-0 border-none">
  <div className="p-8 flex items-center gap-4">
    <div className="p-3 bg-red-50 rounded-2xl">
      <Trash2 className="w-7 h-7 text-red-500" />
    </div>
    <div>
      <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
        Confirmar Acción
      </DialogTitle>
      <DialogDescription className="text-slate-400 text-[13px]">
        Esta operación no se puede deshacer.
      </DialogDescription>
    </div>
  </div>
  
  <div className="px-8 pb-8">
    <p className="text-[#334155] mb-6">¿Estás seguro de eliminar este registro del sistema?</p>
    <div className="flex gap-4">
       <Button variant="ghost" onClick={onClose} className="flex-1 text-[#64748b] font-bold">Mantener</Button>
       <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-12">Confirmar</Button>
    </div>
  </div>
</DialogContent>
    </Dialog>
  );
}
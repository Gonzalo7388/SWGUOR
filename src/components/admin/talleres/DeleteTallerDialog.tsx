"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteTallerDialogProps {
  isOpen: boolean;
  taller: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteTallerDialog({ isOpen, taller, onClose, onSuccess }: DeleteTallerDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/talleres?id=${taller.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar taller');

      toast.success("Taller eliminado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to delete taller:', error);
      toast.error(error.message || "Error al eliminar taller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Eliminar Taller</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              ¿Estás seguro de que deseas eliminar el taller <span className="font-bold text-gray-900">"{taller.nombre}"</span>?
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Se eliminarán todos los registros asociados a este taller.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">RUC:</span>
              <span className="font-mono font-bold">{taller.ruc}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contacto:</span>
              <span className="font-medium">{taller.contacto}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-medium">{taller.telefono}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Taller"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

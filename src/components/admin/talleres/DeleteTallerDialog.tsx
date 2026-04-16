"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteTallerDialogProps {
  isOpen: boolean;
  taller: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteTallerDialog({
  isOpen,
  taller,
  onClose,
  onSuccess,
}: DeleteTallerDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Usamos eliminación lógica (cambiar estado a inactivo) 
      // o física (.delete()). Aquí te pongo la física:
      const { error } = await supabase
        .from("talleres")
        .delete()
        .eq("id", taller.id);

      if (error) throw error;

      toast.success(`Taller "${taller.nombre}" eliminado correctamente`);
      onSuccess(); // Recarga la tabla
      onClose();   // Cierra el modal
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el taller. Verifique si tiene registros asociados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">¿Estás seguro?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600">
            Esta acción eliminará permanentemente el taller{" "}
            <span className="font-bold text-gray-900">"{taller?.nombre}"</span>. 
            Esta operación no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Eliminar Taller
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
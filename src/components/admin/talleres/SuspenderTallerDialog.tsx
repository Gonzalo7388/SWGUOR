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
import { Loader2, ShieldAlert } from "lucide-react";

interface SuspenderTallerDialogProps {
  isOpen: boolean;
  taller: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SuspenderTallerDialog({
  isOpen,
  taller,
  onClose,
  onSuccess,
}: SuspenderTallerDialogProps) { // Corregido el nombre de la interfaz aquí
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleSuspender = async () => {
    if (!taller?.id) return;
    
    setLoading(true);
    try {
      // Cambio de lógica: update en lugar de delete
      const { error } = await supabase
        .from("talleres")
        .update({ estado: "inactivo" }) // O "suspendido" según prefieras en tu DB
        .eq("id", taller.id);

      if (error) throw error;

      toast.success(`Taller "${taller.nombre}" suspendido correctamente`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al suspender:", error);
      toast.error("No se pudo suspender el taller en este momento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[420px] border-none rounded-3xl shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">
              Suspender Taller
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="text-slate-600 leading-relaxed text-sm">
            Estás a punto de suspender el taller{" "}
            <span className="font-bold text-slate-900">"{taller?.nombre}"</span>. 
            <br /><br />
            Al hacerlo, ya no podrá recibir nuevas órdenes de producción, pero se mantendrá su historial para reportes y auditorías.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex gap-3">
          <AlertDialogCancel 
            disabled={loading}
            className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            Cancelar
          </AlertDialogCancel>
          <Button 
            onClick={handleSuspender} 
            disabled={loading}
            className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-amber-100 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : "Confirmar Suspensión"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
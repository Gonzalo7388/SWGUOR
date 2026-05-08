"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface SuspenderTallerDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  taller:    any;
}

export default function SuspenderTallerDialog({
  isOpen, onClose, onSuccess, taller,
}: SuspenderTallerDialogProps) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const nombre = taller?.nombre ?? "este taller";

  const handleSuspender = async () => {
    if (!taller?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("talleres")
        .update({ estado: "suspendido" })
        .eq("id", taller.id);

      if (error) throw error;

      toast.success(`"${nombre}" ha sido suspendido correctamente`);
      onSuccess();
      onClose();
    } catch {
      toast.error("No se pudo suspender el taller en este momento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-none shadow-2xl bg-white overflow-hidden">

        {/* Franja superior */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 w-full" />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex-shrink-0">
              <ShieldOff className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                Suspender Taller
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                El registro se conserva — solo se desactiva para nuevas órdenes.
              </DialogDescription>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-2">
            <p className="text-sm text-slate-700">
              ¿Confirmas que deseas suspender a{" "}
              <span className="font-semibold text-amber-700">{nombre}</span>?
            </p>
            <ul className="text-xs text-slate-500 space-y-1 mt-2">
              {[
                "Ya no podrá recibir nuevas órdenes de producción.",
                "Su historial y datos se conservan para reportes y auditorías.",
                "Puede reactivarse en cualquier momento desde editar.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}
              className="flex-1 text-slate-500 hover:bg-slate-100">
              Cancelar
            </Button>
            <Button onClick={handleSuspender} disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100 transition-all">
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suspendiendo…</>
                : "Suspender Taller"
              }
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, Loader2 } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────
interface UsuarioResumen {
  id: string;
  email: string;
  personal_interno?: {
    nombre_completo: string | null;
  } | null;
}

interface SuspenderUsuarioDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  usuario:   UsuarioResumen | null;
}

// ─── Componente ───────────────────────────────────────────────
export default function SuspenderUsuarioDialog({
  isOpen, onClose, onSuccess, usuario,
}: SuspenderUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);

  const nombre = usuario?.personal_interno?.nombre_completo ?? usuario?.email ?? "este usuario";

  const handleSuspender = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      // Llama a toggleEstado del servicio: cambia estado a "inactivo"
      // y banea al usuario en Supabase Auth (ban_duration: '87600h')
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/estado`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: "inactivo" }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? "Error al suspender usuario");

      toast.success(`${nombre} ha sido suspendido correctamente`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message ?? "No se pudo suspender el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-none shadow-2xl bg-white overflow-hidden">

        {/* Franja superior ámbar — distingue visualmente de una acción destructiva irreversible */}
        <div className="h-1.5 bg-amber-500 w-full" />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex-shrink-0">
              <ShieldOff className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                Suspender Usuario
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                El registro se conserva — solo se desactiva el acceso.
              </DialogDescription>
            </div>
          </div>

          {/* Cuerpo de advertencia */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-2">
            <p className="text-sm text-slate-700">
              ¿Confirmas que deseas suspender a{" "}
              <span className="font-semibold text-amber-700">{nombre}</span>?
            </p>
            <ul className="text-xs text-slate-500 space-y-1 mt-2 list-none">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Su sesión será bloqueada inmediatamente en Supabase Auth.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                No podrá iniciar sesión mientras esté suspendido.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Todos sus datos se conservan y se puede reactivar en cualquier momento.
              </li>
            </ul>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-slate-500 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSuspender}
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100 transition-all"
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suspendiendo…</>
                : "Suspender acceso"
              }
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}
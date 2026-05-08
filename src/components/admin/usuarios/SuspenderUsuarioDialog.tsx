"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button }      from "@/components/ui/button";
import { Badge }       from "@/components/ui/badge";
import { toast }       from "sonner";
import { ShieldOff, CircleCheck, Loader2 } from "lucide-react";
import type { usuarios } from "@prisma/client";

interface SuspenderUsuarioDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  usuario:   usuarios;
}

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function SuspenderUsuarioDialog({
  isOpen, onClose, onSuccess, usuario,
}: SuspenderUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);

  const email    = usuario?.email ?? "—";
  const rol      = usuario?.rol   ?? "Sin rol";
  const initials = getInitials(email);

  const handleSuspender = async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: "suspendido" }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Error desconocido");
      }
      toast.success(`"${email}" ha sido suspendido correctamente`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo suspender el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="w-[340px] p-0 gap-0 border border-slate-200 shadow-xl rounded-2xl bg-white overflow-hidden">

        <div className="p-4 space-y-3"> 

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <ShieldOff className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 leading-none">
                Suspender acceso
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Esta acción puede revertirse en cualquier momento.
              </DialogDescription>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-100" />

          {/* Label */}
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mb-2">
            Usuario afectado
          </p>

          {/* Tarjeta usuario */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-blue-700">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-700 truncate">{email}</p>
              <p className="text-[10px] text-slate-400 capitalize">{rol}</p>
            </div>
            <Badge className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0 shrink-0 shadow-none">
              Activo
            </Badge>
          </div>

          {/* Consecuencias */}
          <ul className="space-y-1.5">
            {[
              "El historial y datos del usuario se conservan intactos.",
              "No podrá iniciar sesión hasta ser reactivado.",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CircleCheck className="w-3 h-3 text-slate-300 shrink-0" strokeWidth={2} />
                <span className="text-xs text-slate-500">{item}</span>
              </li>
            ))}
          </ul>

        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex gap-2"> 
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-9 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSuspender}
            disabled={loading}
            className="flex-1 h-9 text-xs font-semibold bg-red-800 hover:bg-red-900 text-red-50 rounded-xl shadow-none gap-1.5"
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Suspendiendo…</>
            ) : (
              <><ShieldOff className="h-3.5 w-3.5" />Suspender usuario</>
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
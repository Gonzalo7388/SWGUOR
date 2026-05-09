"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, CircleCheck, Loader2, X, AlertTriangle, ShieldAlert, UserX, Fingerprint } from "lucide-react";
import type { usuarios } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SuspenderUsuarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: usuarios;
}

function getInitials(email: string): string {
  if (!email) return "??";
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

  const email = usuario?.email ?? "—";
  const rol = usuario?.rol ?? "Sin rol";
  const initials = getInitials(email);

  const handleSuspender = async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "suspendido" }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Error desconocido");
      }
      toast.success(`Acceso Revocado: ${email} ha sido suspendido`);
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
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_128px_-32px_rgba(225,29,72,0.2)] p-0 overflow-hidden rounded-[40px] animate-in zoom-in-95 duration-500">

        {/* CABECERA DE SEGURIDAD */}
        <div className="bg-gradient-to-br from-amber-600 via-rose-700 to-rose-900 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="mt-8 space-y-1 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              Suspender <br /> Credenciales
            </DialogTitle>
            <DialogDescription className="text-rose-100 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Fingerprint className="w-3 h-3" /> Acción Administrativa Crítica
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* TARJETA USUARIO */}
          <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-black text-slate-800">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidad en Riesgo</p>
              <p className="text-sm font-black text-slate-800 truncate">{email}</p>
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-tighter">{rol}</p>
            </div>
          </div>

          {/* CONSECUENCIAS */}
          <div className="space-y-4 px-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Impacto Operativo</p>
            <ul className="space-y-3">
              {[
                { icon: <UserX className="w-4 h-4" />, text: "Revocación inmediata del token de sesión." },
                { icon: <AlertTriangle className="w-4 h-4" />, text: "Bloqueo de acceso a todos los módulos." },
                { icon: <CircleCheck className="w-4 h-4" />, text: "Los registros históricos se mantendrán." },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <div className="text-rose-500">{item.icon}</div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSuspender}
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-700 hover:to-rose-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-200 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ejecutando...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Suspender Usuario
                  <ShieldOff className="w-4 h-4" />
                </div>
              )}
            </Button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Cerrar sin Cambios
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
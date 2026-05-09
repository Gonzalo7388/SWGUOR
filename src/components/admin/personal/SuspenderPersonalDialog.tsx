"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShieldOff, ShieldCheck, Loader2, X, AlertTriangle,
  ShieldAlert, UserX, UserCheck, Fingerprint, Briefcase,
  History, Lock
} from "lucide-react";
import type { PersonalRow } from "@/lib/services/personal-interno-services";
import { cn } from "@/lib/utils";

interface SuspenderPersonalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  personal: PersonalRow | null;
}

export default function SuspenderPersonalDialog({
  isOpen, onClose, onSuccess, personal,
}: SuspenderPersonalDialogProps) {
  const [loading, setLoading] = useState(false);

  const nombre = personal?.nombre_completo ?? "Colaborador";
  const cargo = personal?.cargo?.replace(/_/g, " ") ?? "Sin cargo";
  const activo = personal?.estado === "activo";
  const accion = activo ? "Suspender" : "Reactivar";

  const handleConfirmar = async () => {
    if (!personal) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/personal/${personal.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspender: activo }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `Error al ${accion.toLowerCase()} personal`);

      toast.success(
        activo
          ? `Acceso Revocado: ${nombre} ha sido suspendido`
          : `Acceso Restaurado: ${nombre} está activo nuevamente`,
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[40px] animate-in zoom-in-95 duration-500">

        {/* CABECERA DINÁMICA */}
        <div className={cn(
          "px-8 py-10 text-white relative overflow-hidden transition-colors duration-700",
          activo
            ? "bg-gradient-to-br from-amber-500 via-rose-700 to-rose-900 shadow-[inset_0_-24px_48px_-12px_rgba(0,0,0,0.1)]"
            : "bg-gradient-to-br from-teal-500 via-emerald-700 to-indigo-900"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
              {activo ? <ShieldAlert className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="mt-8 space-y-1 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              {activo ? "Suspender" : "Reactivar"} <br /> Credenciales
            </DialogTitle>
            <DialogDescription className="text-white/60 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Fingerprint className="w-3 h-3" /> Seguridad de Infraestructura GUOR
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* TARJETA COLABORADOR */}
          <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-white shadow-sm border flex items-center justify-center shrink-0 transition-colors",
              activo ? "border-amber-100" : "border-emerald-100"
            )}>
              {activo ? <UserX className="w-6 h-6 text-amber-500" /> : <UserCheck className="w-6 h-6 text-emerald-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</p>
              <p className="text-sm font-black text-slate-800 truncate">{nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Briefcase className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{cargo}</p>
              </div>
            </div>
          </div>

          {/* IMPACTO */}
          <div className="space-y-4 px-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Consecuencias de Acción</p>
            <ul className="space-y-4">
              {activo ? (
                <>
                  <ImpactItem icon={<Lock className="w-4 h-4 text-rose-500" />} text="Cierre inmediato de sesiones activas." />
                  <ImpactItem icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} text="Inhabilitación de módulos administrativos." />
                  <ImpactItem icon={<History className="w-4 h-4 text-blue-500" />} text="Se mantiene la trazabilidad histórica." />
                </>
              ) : (
                <>
                  <ImpactItem icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} text="Restauración total de privilegios." />
                  <ImpactItem icon={<UserCheck className="w-4 h-4 text-teal-500" />} text="Acceso inmediato al portal administrativo." />
                </>
              )}
            </ul>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleConfirmar}
              disabled={loading}
              className={cn(
                "w-full h-16 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95",
                activo
                  ? "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Confirmar {accion}
                  {activo ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
              )}
            </Button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Mantener Estado Actual
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

function ImpactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-relaxed">
      <div className="mt-0.5 shrink-0">{icon}</div>
      {text}
    </li>
  );
}

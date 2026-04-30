"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, Loader2, Briefcase } from "lucide-react";
import type { PersonalRow } from "@/lib/services/personal-interno-services";

// ─── Tipos ────────────────────────────────────────────────────
interface SuspenderPersonalDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  personal:  PersonalRow | null;
}

// ─── Componente ───────────────────────────────────────────────
export default function SuspenderPersonalDialog({
  isOpen, onClose, onSuccess, personal,
}: SuspenderPersonalDialogProps) {
  const [loading, setLoading] = useState(false);

  const nombre = personal?.nombre_completo ?? "este miembro";
  const cargo  = personal?.cargo?.replace(/_/g, " ") ?? null;
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
          ? `${nombre} ha sido suspendido correctamente`
          : `${nombre} ha sido reactivado correctamente`,
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
      <DialogContent className="max-w-md p-0 border-none shadow-2xl bg-white overflow-hidden">

        <div className={`h-2 w-full ${activo ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600" : "bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500"}`} />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
              activo ? "bg-amber-50 border-amber-100" : "bg-teal-50 border-teal-100"
            }`}>
              <ShieldOff className={`w-5 h-5 ${activo ? "text-amber-600" : "text-teal-600"}`} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                {accion} Personal
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {activo
                  ? "El registro se conserva — solo se desactiva el acceso."
                  : "Se restaurará el acceso al sistema para este miembro."
                }
              </DialogDescription>
            </div>
          </div>

          {/* Info del miembro */}
          <div className={`rounded-lg border p-4 space-y-3 ${
            activo ? "bg-amber-50 border-amber-100" : "bg-teal-50 border-teal-100"
          }`}>
            <p className="text-sm text-slate-700">
              ¿Confirmas que deseas{" "}
              <span className={`font-semibold ${activo ? "text-amber-700" : "text-teal-700"}`}>
                {accion.toLowerCase()}
              </span>{" "}
              a <span className="font-semibold text-slate-800">{nombre}</span>?
            </p>

            {cargo && (
              <div className="flex items-center gap-1.5 w-fit">
                <Briefcase size={11} className="text-slate-400" />
                <span className="text-[11px] text-slate-500 capitalize font-medium">{cargo}</span>
              </div>
            )}

            <ul className="text-xs text-slate-500 space-y-1 list-none mt-1">
              {activo ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    No podrá iniciar sesión mientras esté suspendido.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Todos sus datos se conservan y se puede reactivar en cualquier momento.
                  </li>
                </>
              ) : (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  Podrá iniciar sesión con sus credenciales existentes.
                </li>
              )}
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
              onClick={handleConfirmar}
              disabled={loading}
              className={`flex-1 text-white shadow-md transition-all ${
                activo
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                  : "bg-teal-600 hover:bg-teal-700 shadow-teal-100"
              }`}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{accion}ndo…</>
                : `${accion} acceso`
              }
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}
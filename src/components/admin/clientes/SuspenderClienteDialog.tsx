"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldOff, Loader2, Building2 } from "lucide-react";
import type { ClienteListItem } from "@/lib/services/clientes-services";

// ─── Tipos ────────────────────────────────────────────────────
interface SuspenderClienteDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  cliente:   ClienteListItem | null; 
}

// ─── Componente ───────────────────────────────────────────────
export default function SuspenderClienteDialog({
  isOpen, onClose, onSuccess, cliente,
}: SuspenderClienteDialogProps) {
  const [loading, setLoading] = useState(false);

  const razonSocial = cliente?.razon_social ?? null;
  const ruc         = cliente?.ruc           ?? null;
  const email       = cliente?.email                   ?? "";
  const activo      = cliente?.activo;

  const display     = razonSocial ?? email;
  const nuevoEstado = activo ? "inactivo" : "activo";
  const accion      = activo ? "Suspender" : "Reactivar";

  const handleConfirmar = async () => {
    if (!cliente) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/estado`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? `Error al ${accion.toLowerCase()} cliente`);

      toast.success(
        activo
          ? `La cuenta de ${display} ha sido suspendida`
          : `La cuenta de ${display} ha sido reactivada`,
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

        {/* Franja: ámbar para suspender, azul para reactivar */}
        <div className={`h-1.5 w-full ${activo ? "bg-amber-500" : "bg-blue-500"}`} />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
              activo ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
            }`}>
              <ShieldOff className={`w-5 h-5 ${activo ? "text-amber-600" : "text-blue-600"}`} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                {accion} Cliente
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {activo
                  ? "La cuenta del cliente será deshabilitada."
                  : "Se restaurará el acceso al sistema para este cliente."
                }
              </DialogDescription>
            </div>
          </div>

          {/* Info del cliente */}
          <div className={`rounded-lg border p-4 space-y-3 ${
            activo ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
          }`}>
            <p className="text-sm text-slate-700">
              ¿Confirmas que deseas{" "}
              <span className={`font-semibold ${activo ? "text-amber-700" : "text-blue-700"}`}>
                {accion.toLowerCase()}
              </span>{" "}
              la cuenta de{" "}
              <span className="font-semibold text-slate-800">{display}</span>?
            </p>

            {/* Datos del cliente */}
            <div className="flex flex-col gap-1">
              {razonSocial && (
                <div className="flex items-center gap-1.5">
                  <Building2 size={11} className="text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-500 font-medium">
                    {razonSocial}
                  </span>
                </div>
              )}
              {ruc && (
                <span className="text-[11px] text-slate-400 font-mono ml-4">
                  RUC: {ruc}
                </span>
              )}
            </div>

            {/* Consecuencias */}
            <ul className="text-xs text-slate-500 space-y-1 list-none mt-1">
              {activo ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    El cliente no podrá iniciar sesión en el portal.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Su historial de pedidos y datos se conservan íntegramente.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Se puede reactivar la cuenta en cualquier momento.
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    Se habilitará el acceso al portal del cliente.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    Podrá iniciar sesión con sus credenciales existentes.
                  </li>
                </>
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
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              }`}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{accion}ndo…</>
              ) : (
                `${accion} cuenta`
              )}
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}
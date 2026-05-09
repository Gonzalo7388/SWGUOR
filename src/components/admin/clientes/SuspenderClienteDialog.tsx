"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ShieldOff, Loader2, Building2, AlertTriangle, 
  CheckCircle2, X, AlertCircle, Info, Hash, Mail,
  UserCheck, UserMinus, ShieldAlert, ShieldCheck
} from "lucide-react";
import type { ClienteListItem } from "@/lib/services/clientes-services";
import { cn } from "@/lib/utils";

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
          ? `Operación exitosa: Acceso restringido para ${display}`
          : `Operación exitosa: Acceso restaurado para ${display}`,
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
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[40px] animate-in zoom-in-95 duration-500">
        
        {/* CABECERA DINÁMICA SEGÚN ESTADO */}
        <div className={cn(
          "px-8 py-10 text-white relative overflow-hidden",
          activo ? "bg-amber-600" : "bg-indigo-600"
        )}>
          {/* Elementos decorativos glass */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
              {activo ? <UserMinus className="w-7 h-7 text-white" /> : <UserCheck className="w-7 h-7 text-white" />}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
               <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="mt-8 space-y-1 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              {accion} <br /> Acceso
            </DialogTitle>
            <DialogDescription className="text-white/70 font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
              Seguridad Administrativa GUOR PRO
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* TARJETA DE INFORMACIÓN DEL CLIENTE */}
          <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidad Identificada</p>
                   <p className="text-sm font-black text-slate-800 line-clamp-1">{display}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Registro
                   </p>
                   <p className="text-[11px] font-bold text-slate-600">{ruc || "N/A"}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Contacto
                   </p>
                   <p className="text-[11px] font-bold text-slate-600 truncate">{email || "Sin correo"}</p>
                </div>
             </div>
          </div>

          {/* MENSAJE DE ADVERTENCIA */}
          <div className={cn(
             "p-6 rounded-[24px] border relative overflow-hidden group",
             activo ? "bg-amber-50/50 border-amber-100" : "bg-indigo-50/50 border-indigo-100"
          )}>
             <div className="flex gap-4 relative z-10">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  activo ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                )}>
                  {activo ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div className="space-y-3">
                   <p className="text-sm font-black text-slate-800">
                      Impacto de la Operación
                   </p>
                   <ul className="space-y-2">
                     {activo ? (
                       <>
                         <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                            <AlertCircle className="w-3 h-3 mt-0.5 text-amber-500" />
                            El cliente perderá acceso inmediato al portal corporativo.
                         </li>
                         <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                            <AlertCircle className="w-3 h-3 mt-0.5 text-amber-500" />
                            No podrá generar nuevas cotizaciones ni visualizar pedidos.
                         </li>
                       </>
                     ) : (
                       <>
                         <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-indigo-500" />
                            Se restaurará la capacidad de login y operación comercial.
                         </li>
                         <li className="flex items-start gap-2 text-[11px] font-bold text-slate-500">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-indigo-500" />
                            El cliente podrá visualizar todo su historial previo.
                         </li>
                       </>
                     )}
                   </ul>
                </div>
             </div>
          </div>

          {/* ACCIONES FINALES */}
          <DialogFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={loading}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 text-base uppercase tracking-widest",
                activo 
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-200/50" 
                  : "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-indigo-200/50"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sincronizando...
                </div>
              ) : (
                `Confirmar ${accion}`
              )}
            </Button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Cerrar sin Cambios
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserCog, ShieldCheck, Mail, X, Loader2, Save,
  Settings2, ShieldAlert, Fingerprint
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Rol, usuarios } from "@prisma/client";
import { cn } from "@/lib/utils";

const ROLES_SISTEMA: { value: Rol; label: string }[] = [
  { value: "gerente", label: "Gerente General" },
  { value: "administrador", label: "Administrador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "disenador", label: "Diseñador" },
  { value: "cortador", label: "Cortador" },
  { value: "ayudante", label: "Ayudante" },
  { value: "representante_taller", label: "Representante de Taller" },
  { value: "cliente", label: "Cliente" },
];

interface EditUsuarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: usuarios;
}

export default function EditUsuarioDialog({
  isOpen, onClose, onSuccess, usuario,
}: EditUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(usuario?.rol ?? null);
  const [rolActual, setRolActual] = useState<Rol | null>(null);

  const puedeEditarEmail = rolActual === 'administrador';

  useEffect(() => {
    if (!isOpen) return;

    const fetchRolActual = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('auth_id', user.id)
        .single();

      if (!error && data?.rol) setRolActual(data.rol as Rol);
    };

    fetchRolActual();
  }, [isOpen]);

  useEffect(() => {
    if (usuario) setRolSeleccionado(usuario.rol ?? null);
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payloadUsuario: Record<string, unknown> = {
      id: usuario.id,
      rol: rolSeleccionado,
    };
    if (puedeEditarEmail) {
      payloadUsuario.email = formData.get('email') as string;
    }

    try {
      const resUsuario = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadUsuario),
      });
      if (!resUsuario.ok) throw new Error('Error actualizando usuario');

      toast.success("Perfil sincronizado: Los privilegios han sido actualizados");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "No se pudieron guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[48px] animate-in zoom-in-95 duration-500">

        {/* HEADER PREMIUM */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-10 py-12 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl rotate-3 transition-transform hover:rotate-0">
              <Settings2 className="w-8 h-8 text-indigo-400" />
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="mt-8 space-y-2 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              Gestión de <br /> Privilegios
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-indigo-500" /> Configuración Avanzada GUOR PRO
            </DialogDescription>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <form onSubmit={handleSubmit} id="edit-usuario-form" className="space-y-8">

            <div className="space-y-8">
              {/* Email */}
              <Field icon={<Mail className="w-4 h-4" />} label="Identidad Corporativa">
                <div className="relative group">
                  <Input
                    name="email"
                    type="email"
                    defaultValue={usuario?.email}
                    disabled={!puedeEditarEmail}
                    className={cn(
                      inputCls,
                      !puedeEditarEmail && "bg-slate-50/50 border-dashed text-slate-400 cursor-not-allowed"
                    )}
                  />
                  {!puedeEditarEmail && (
                    <div className="flex items-center gap-2 mt-3 px-1">
                      <ShieldAlert className="w-3 h-3 text-slate-300" />
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Solo administradores pueden editar este campo</p>
                    </div>
                  )}
                </div>
              </Field>

              {/* Rol */}
              <Field icon={<ShieldCheck className="w-4 h-4" />} label="Nivel de Acceso (Rol)">
                <Select
                  value={rolSeleccionado ?? ''}
                  onValueChange={(value) => setRolSeleccionado(value as Rol)}
                >
                  <SelectTrigger className={cn(inputCls, "bg-white")}>
                    <SelectValue placeholder="Seleccione un cargo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[32px] border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl max-h-64">
                    {ROLES_SISTEMA.map((rol) => (
                      <SelectItem key={rol.value} value={rol.value} className="rounded-2xl py-3 px-4 font-bold focus:bg-indigo-50 transition-colors">
                        {rol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </form>

          {/* ACCIONES FINALES */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100/50">
            <Button
              type="submit"
              form="edit-usuario-form"
              disabled={loading}
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando Cambios...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Actualizar Privilegios
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
              )}
            </Button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Descartar Modificaciones
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers Premium ──────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-200 focus:shadow-xl focus:shadow-indigo-50/50 focus-visible:ring-0 transition-all h-14 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-[11px] uppercase font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] ml-1">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}

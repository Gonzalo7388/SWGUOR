"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserPlus, Mail, ShieldCheck, Lock, Eye, EyeOff, X,
  KeyRound, ShieldAlert, Fingerprint, UserCheck,
  Loader2
} from "lucide-react";
import type { Rol } from "@prisma/client";
import { cn } from "@/lib/utils";

// ─── Roles disponibles ────────────────────────────────────────
const ROLES: { value: Rol; label: string }[] = [
  { value: "gerente", label: "Gerente General" },
  { value: "administrador", label: "Administrador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "disenador", label: "Diseñador" },
  { value: "cortador", label: "Cortador" },
  { value: "ayudante", label: "Ayudante" },
  { value: "representante_taller", label: "Representante de Taller" },
  { value: "cliente", label: "Cliente" },
];

interface CreateUsuarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  email: string;
  password: string;
  rol: string;
}

const INITIAL_FORM: FormState = { email: "", password: "", rol: "" };

export default function CreateUsuarioDialog({ isOpen, onClose, onSuccess }: CreateUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rol) return toast.error("Seleccione un rol de acceso");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, rol: form.rol }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? "Error al crear usuario");

      toast.success("Credenciales generadas: Usuario registrado en el sistema");
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[500px] bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[48px] animate-in zoom-in-95 duration-500">

        {/* CABECERA PREMIUM */}
        <div className="bg-gradient-to-br from-pink-600 via-rose-700 to-indigo-950 px-10 py-12 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full -ml-16 -mb-16 blur-2xl" />

          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] shadow-2xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <button onClick={handleClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="mt-8 space-y-2 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              Alta de <br /> Nuevo Usuario
            </DialogTitle>
            <DialogDescription className="text-pink-200 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5" /> Seguridad de Acceso GUOR PRO
            </DialogDescription>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <form onSubmit={handleSubmit} id="create-usuario-form" className="space-y-6">

            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 space-y-8">
              {/* Email */}
              <Field icon={<Mail className="w-4 h-4" />} label="Identificador de Acceso">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="ejemplo@guor.com"
                  required
                  className={inputCls}
                />
              </Field>

              {/* Password */}
              <Field icon={<KeyRound className="w-4 h-4" />} label="Clave de Seguridad">
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    className={cn(inputCls, "pr-14")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              {/* Rol */}
              <Field icon={<ShieldCheck className="w-4 h-4" />} label="Privilegios y Permisos">
                <Select value={form.rol} onValueChange={(v) => setForm((p) => ({ ...p, rol: v }))}>
                  <SelectTrigger className={cn(inputCls, "bg-white cursor-pointer")}>
                    <SelectValue placeholder="Seleccionar nivel de acceso" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[32px] border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="rounded-2xl py-3 px-4 font-bold focus:bg-pink-50 transition-colors">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-3 px-1">
                  <ShieldAlert className="w-3 h-3 text-pink-500" />
                  <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">
                    El rol define la visibilidad de módulos críticos.
                  </p>
                </div>
              </Field>
            </div>
          </form>

          {/* ACCIONES FINALES */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              form="create-usuario-form"
              disabled={loading || !form.rol || !form.email || !form.password}
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generando Acceso...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Registrar Credenciales
                  <UserCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </div>
              )}
            </Button>

            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Cancelar Operación
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers Premium ──────────────────────────────────────────────────
const inputCls = "bg-white border-slate-100 rounded-2xl focus:bg-white focus:border-pink-200 focus:shadow-xl focus:shadow-pink-50/50 focus-visible:ring-0 transition-all h-14 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300";

function Field({ icon, label, children }: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-[11px] uppercase font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] ml-1">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}

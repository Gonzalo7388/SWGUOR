"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Mail, ShieldCheck, Lock, Eye, EyeOff, X } from "lucide-react";
import type { Rol } from "@prisma/client";

// ─── Roles disponibles ────────────────────────────────────────
const ROLES: { value: Rol; label: string }[] = [
  { value: "gerente",              label: "Gerente General"         },
  { value: "administrador",        label: "Administrador"           },
  { value: "recepcionista",        label: "Recepcionista"           },
  { value: "disenador",            label: "Diseñador"               },
  { value: "cortador",             label: "Cortador"                },
  { value: "ayudante",             label: "Ayudante"                },
  { value: "representante_taller", label: "Representante de Taller" },
  { value: "cliente",              label: "Cliente"                 },
];

interface CreateUsuarioDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

interface FormState {
  email:    string;
  password: string;
  rol:      string;
}

const INITIAL_FORM: FormState = { email: "", password: "", rol: "" };

export default function CreateUsuarioDialog({ isOpen, onClose, onSuccess }: CreateUsuarioDialogProps) {
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form,         setForm]         = useState<FormState>(INITIAL_FORM);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: form.email, password: form.password, rol: form.rol }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? "Error al crear usuario");
      toast.success("Usuario creado correctamente");
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
      <DialogContent className="sm:max-w-[440px] border-none shadow-2xl bg-white p-0 overflow-hidden [&>button]:hidden">

        {/* Franja superior coloreada - Borde Visual */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-100 shrink-0">
              <UserPlus className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                Nuevo Usuario
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Crea una cuenta de acceso al sistema.
              </DialogDescription>
            </div>
          </div>
          {/* Botón cerrar custom */}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} id="create-usuario-form" className="px-6 pt-5 pb-2 space-y-5">

          <Field icon={<Mail className="w-3.5 h-3.5" />} label="Correo Electrónico">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="maria.lozano@guor.com"
              required
              className={inputCls}
            />
          </Field>

          <Field icon={<Lock className="w-3.5 h-3.5" />} label="Contraseña">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Rol de Acceso">
            <Select value={form.rol} onValueChange={(v) => setForm((p) => ({ ...p, rol: v }))}>
              <SelectTrigger className={`${inputCls} cursor-pointer`}>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[9px] text-slate-400 italic mt-1">
              El rol determina los módulos a los que el usuario puede acceder.
            </p>
          </Field>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-usuario-form"
            disabled={loading || !form.rol}
            className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-100 px-7 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando…
              </span>
            ) : "Crear Usuario"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-10 text-sm";

function Field({ icon, label, children }: {
  icon:     React.ReactNode;
  label:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}
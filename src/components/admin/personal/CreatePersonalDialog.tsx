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
  UserPlus, User, Hash, Phone, Calendar,
  Briefcase, Mail, Lock, Eye, EyeOff, ShieldCheck,
  X, Loader2, Save, Sparkles, Fingerprint, ShieldAlert,
  IdCard, Contact2, Building2
} from "lucide-react";
import type { Cargo, Rol } from "@prisma/client";
import { cn } from "@/lib/utils";

// ─── Arrays locales tipados ───────────────────────────────────
const CARGOS: { value: Cargo; label: string }[] = [
  { value: "gerente",              label: "Gerente"        },
  { value: "administrador",        label: "Administrador"  },
  { value: "disenador",            label: "Diseñador"      },
  { value: "cortador",             label: "Cortador"       },
  { value: "representante_taller", label: "Rep. de Taller" },
  { value: "recepcionista",        label: "Recepcionista"  },
  { value: "ayudante",             label: "Ayudante"       },
];

const ROLES_INTERNOS: { value: Rol; label: string; descripcion: string }[] = [
  { value: "gerente",              label: "Gerente",        descripcion: "Acceso total al ecosistema GUOR"      },
  { value: "administrador",        label: "Administrador",  descripcion: "Gestión completa de operaciones"      },
  { value: "recepcionista",        label: "Recepcionista",  descripcion: "Atención, ventas y terminal POS"      },
  { value: "disenador",            label: "Diseñador",      descripcion: "Catálogo, ingeniería y producción"    },
  { value: "cortador",             label: "Cortador",       descripcion: "Control de producción e insumos"      },
  { value: "representante_taller", label: "Rep. de Taller", descripcion: "Manufactura y flujo de despachos"     },
  { value: "ayudante",             label: "Ayudante",       descripcion: "Logística y soporte operativo"        },
];

// ─── Tipos ────────────────────────────────────────────────────
interface CreatePersonalDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

interface FormState {
  nombre_completo: string;
  dni:             string;
  telefono:        string;
  cargo:           string;
  fecha_ingreso:   string;
  email:           string;
  password:        string;
  rol:             string;
}

const INITIAL_FORM: FormState = {
  nombre_completo: "",
  dni:             "",
  telefono:        "",
  cargo:           "",
  fecha_ingreso:   "",
  email:           "",
  password:        "",
  rol:             "",
};

export default function CreatePersonalDialog({
  isOpen, onClose, onSuccess,
}: CreatePersonalDialogProps) {
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm]                 = useState<FormState>(INITIAL_FORM);

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === "nombre_completo")
        value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (field === "dni" || field === "telefono")
        value = value.replace(/\D/g, "");
      setForm(prev => ({ ...prev, [field]: value }));
    };

  const handleSelect = (field: keyof FormState) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.dni && form.dni.length !== 8) return toast.error("El DNI debe tener 8 dígitos");
    if (form.password.length < 8) return toast.error("Contraseña insegura (mín. 8 caracteres)");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/personal", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:           form.email.trim().toLowerCase(),
          password:        form.password,
          rol:             form.rol,
          nombre_completo: form.nombre_completo.trim(),
          cargo:           form.cargo,
          ...(form.dni           && { dni:           Number(form.dni)      }),
          ...(form.telefono      && { telefono:      Number(form.telefono) }),
          ...(form.fecha_ingreso && { fecha_ingreso: form.fecha_ingreso    }),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? "Error al crear el personal");

      toast.success("Perfil corporativo generado correctamente");
      handleClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const rolSeleccionado = ROLES_INTERNOS.find(r => r.value === form.rol);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-3xl border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[48px] max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* HEADER PREMIUM */}
        <div className="bg-gradient-to-br from-teal-600 via-emerald-800 to-indigo-950 px-10 py-10 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl rotate-3 transition-transform hover:rotate-0">
                <UserPlus className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                    Alta de Personal
                  </DialogTitle>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
                    Estructura Corporativa
                  </div>
                </div>
                <DialogDescription className="text-slate-400 font-bold text-sm mt-1">
                  Registra nuevos talentos y define sus privilegios de acceso.
                </DialogDescription>
              </div>
            </div>
            <button onClick={handleClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
               <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar bg-white/50">
          <form onSubmit={handleSubmit} id="create-personal-form" className="space-y-12">
            
            {/* SECCIÓN 1: IDENTIDAD */}
            <div className="space-y-8">
              <SectionHeader icon={<IdCard className="w-4 h-4" />} label="Identidad y Contratación" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full">
                  <Field label="Nombre Completo del Colaborador" icon={<User className="w-4 h-4" />}>
                    <Input
                      value={form.nombre_completo}
                      onChange={handleChange("nombre_completo")}
                      placeholder="Ej. Carlos Mamani Quispe"
                      required
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="DNI / Cédula" icon={<Hash className="w-4 h-4" />}>
                  <Input
                    value={form.dni}
                    onChange={handleChange("dni")}
                    placeholder="8 dígitos"
                    maxLength={8}
                    className={inputCls}
                  />
                </Field>

                <Field label="Contacto Directo" icon={<Phone className="w-4 h-4" />}>
                  <Input
                    value={form.telefono}
                    onChange={handleChange("telefono")}
                    placeholder="Número de celular"
                    className={inputCls}
                  />
                </Field>

                <Field label="Cargo Operativo" icon={<Briefcase className="w-4 h-4" />}>
                  <Select value={form.cargo} onValueChange={handleSelect("cargo")}>
                    <SelectTrigger className={cn(inputCls, "bg-white")}>
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      {CARGOS.map(c => (
                        <SelectItem key={c.value} value={c.value} className="rounded-2xl py-3 px-4 font-bold focus:bg-emerald-50 transition-colors">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Fecha de Inicio" icon={<Calendar className="w-4 h-4" />}>
                  <Input
                    type="date"
                    value={form.fecha_ingreso}
                    onChange={handleChange("fecha_ingreso")}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* SECCIÓN 2: SEGURIDAD */}
            <div className="space-y-8">
              <SectionHeader icon={<Fingerprint className="w-4 h-4" />} label="Credenciales de Acceso" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full">
                  <Field label="Correo Corporativo" icon={<Mail className="w-4 h-4" />}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="usuario@guor.com"
                      required
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Clave de Seguridad" icon={<Lock className="w-4 h-4" />}>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      className={cn(inputCls, "pr-14")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>

                <Field label="Rol Administrativo" icon={<ShieldCheck className="w-4 h-4" />}>
                  <Select value={form.rol} onValueChange={handleSelect("rol")}>
                    <SelectTrigger className={cn(inputCls, "bg-white")}>
                      <SelectValue placeholder="Definir privilegios" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      {ROLES_INTERNOS.map(r => (
                        <SelectItem key={r.value} value={r.value} className="rounded-2xl py-3 px-4 font-bold focus:bg-emerald-50 transition-colors">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rolSeleccionado && (
                    <div className="flex items-center gap-2 mt-3 px-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">
                        {rolSeleccionado.descripcion}
                      </p>
                    </div>
                  )}
                </Field>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER PREMIUM */}
        <div className="px-10 py-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100/50 shrink-0 flex items-center justify-between gap-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 rounded-2xl h-14 px-8"
          >
            Descartar Registro
          </Button>
          <Button
            type="submit"
            form="create-personal-form"
            disabled={loading || !form.rol || !form.nombre_completo || !form.email || !form.password}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-200 rounded-[24px] h-14 px-10 font-black uppercase text-xs tracking-widest group"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                Generar Perfil
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers Premium ──────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-100 rounded-[20px] focus:bg-white focus:border-emerald-200 focus:shadow-xl focus:shadow-emerald-50/50 focus-visible:ring-0 transition-all h-14 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300";

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
        {icon}
      </div>
      <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-[11px] uppercase font-black text-slate-400 flex items-center gap-2 tracking-[0.1em] ml-1">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}
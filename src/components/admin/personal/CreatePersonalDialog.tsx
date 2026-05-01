"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
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
} from "lucide-react";
import type { Cargo, Rol } from "@prisma/client";

// ─── Arrays locales tipados ───────────────────────────────────
// Solo cargos válidos para personal interno
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
  { value: "gerente",              label: "Gerente",        descripcion: "Acceso total al sistema"              },
  { value: "administrador",        label: "Administrador",  descripcion: "Gestión completa excepto reportes"    },
  { value: "recepcionista",        label: "Recepcionista",  descripcion: "Ventas, pedidos y clientes"           },
  { value: "disenador",            label: "Diseñador",      descripcion: "Catálogo, pedidos y producción"       },
  { value: "cortador",             label: "Cortador",       descripcion: "Producción e inventario"              },
  { value: "representante_taller", label: "Rep. de Taller", descripcion: "Manufactura y despachos"              },
  { value: "ayudante",             label: "Ayudante",       descripcion: "Inventario y logística"               },
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

// ─── Componente ───────────────────────────────────────────────
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

  // ── Validaciones ────────────────────────────────────────────
  const validarFormulario = (): string | null => {
    if (!form.nombre_completo.trim()) return "El nombre completo es requerido";
    if (form.dni && form.dni.length !== 8) return "El DNI debe tener exactamente 8 dígitos";
    if (!form.cargo)    return "Selecciona un cargo";
    if (!form.email)    return "El correo electrónico es requerido";
    if (form.password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!form.rol)      return "Selecciona un rol de acceso";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validarFormulario();
    if (error) { toast.error(error); return; }

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

      toast.success(`${form.nombre_completo.trim()} fue registrado correctamente`);
      handleClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Rol seleccionado para mostrar su descripción
  const rolSeleccionado = ROLES_INTERNOS.find(r => r.value === form.rol);

  // ── Render ──────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] border-none shadow-2xl bg-white p-0 overflow-hidden max-h-[95vh] flex flex-col">

        {/* Franja superior */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 w-full shrink-0" />

        <div className="p-6 overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                <UserPlus className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                  Nuevo Personal Interno
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Registra un nuevo miembro del equipo con acceso al panel.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} id="create-personal-form" className="space-y-7">

            {/* ── Sección 1: Datos Personales ── */}
            <section>
              <SectionDivider label="Datos Personales" />
              <div className="space-y-4">

                <FieldWrapper icon={<User className="w-3.5 h-3.5" />} label="Nombre Completo" required>
                  <Input
                    value={form.nombre_completo}
                    onChange={handleChange("nombre_completo")}
                    placeholder="Ej. Carlos Mamani Quispe"
                    required
                    className={inputCls}
                  />
                  <FieldHint>Solo letras, espacios y acentos</FieldHint>
                </FieldWrapper>

                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper icon={<Hash className="w-3.5 h-3.5" />} label="DNI">
                    <Input
                      value={form.dni}
                      onChange={handleChange("dni")}
                      placeholder="12345678"
                      maxLength={8}
                      inputMode="numeric"
                      className={inputCls}
                    />
                    <FieldHint>8 dígitos</FieldHint>
                  </FieldWrapper>

                  <FieldWrapper icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono">
                    <Input
                      value={form.telefono}
                      onChange={handleChange("telefono")}
                      placeholder="987654321"
                      maxLength={12}
                      inputMode="numeric"
                      className={inputCls}
                    />
                  </FieldWrapper>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper icon={<Briefcase className="w-3.5 h-3.5" />} label="Cargo" required>
                    <Select value={form.cargo} onValueChange={handleSelect("cargo")} required>
                      <SelectTrigger className={`${inputCls} cursor-pointer`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARGOS.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>

                  <FieldWrapper icon={<Calendar className="w-3.5 h-3.5" />} label="Fecha de Ingreso">
                    <Input
                      type="date"
                      value={form.fecha_ingreso}
                      onChange={handleChange("fecha_ingreso")}
                      max={new Date().toISOString().split("T")[0]} // ✅ No fechas futuras
                      className={inputCls}
                    />
                  </FieldWrapper>
                </div>

              </div>
            </section>

            {/* ── Sección 2: Acceso al Sistema ── */}
            <section>
              <SectionDivider label="Acceso al Sistema" />
              <div className="space-y-4">

                <FieldWrapper icon={<Mail className="w-3.5 h-3.5" />} label="Correo Electrónico" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="correo@empresa.com"
                    required
                    className={inputCls}
                  />
                </FieldWrapper>

                <FieldWrapper icon={<Lock className="w-3.5 h-3.5" />} label="Contraseña" required>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldHint>Al menos 8 caracteres — combina letras y números</FieldHint>
                </FieldWrapper>

                <FieldWrapper icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Rol de Acceso" required>
                  <Select value={form.rol} onValueChange={handleSelect("rol")} required>
                    <SelectTrigger className={`${inputCls} cursor-pointer`}>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_INTERNOS.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          <div className="flex flex-col">
                            <span>{r.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* ✅ Descripción dinámica del rol seleccionado */}
                  {rolSeleccionado && (
                    <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1.5 bg-teal-50 border border-teal-100 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-teal-500 shrink-0" />
                      <p className="text-[10px] text-teal-700 font-medium">
                        {rolSeleccionado.descripcion}
                      </p>
                    </div>
                  )}
                </FieldWrapper>

              </div>
            </section>

          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex gap-2">
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
            form="create-personal-form"
            disabled={loading || !form.cargo || !form.rol}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-100 px-7 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando…
              </span>
            ) : (
              "Crear Personal"
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers de UI ────────────────────────────────────────────
const inputCls =
  "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-teal-400 transition-all h-10 text-sm";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function FieldWrapper({ icon, label, required, children }: {
  icon:      React.ReactNode;
  label:     string;
  required?: boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        {icon}
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-slate-400 italic leading-tight mt-1">{children}</p>
  );
}
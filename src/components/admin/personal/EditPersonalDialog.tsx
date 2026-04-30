"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserCog, Hash, Phone, Briefcase, Calendar, User } from "lucide-react";
import type { Cargo } from "@prisma/client";
import type { PersonalRow } from "@/lib/services/personal-interno-services";

const CARGOS: { value: Cargo; label: string }[] = [
  { value: "gerente",              label: "Gerente"        },
  { value: "administrador",        label: "Administrador"  },
  { value: "disenador",            label: "Diseñador"      },
  { value: "cortador",             label: "Cortador"       },
  { value: "representante_taller", label: "Rep. de Taller" },
  { value: "recepcionista",        label: "Recepcionista"  },
  { value: "ayudante",             label: "Ayudante"       },
];

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  personal:   PersonalRow | null;
}

// ✅ Sin campo `estado` — se gestiona exclusivamente desde SuspenderPersonalDialog
// para garantizar la sincronización con usuarios + Supabase Auth
interface FormState {
  nombre_completo: string;
  cargo:           string;
  dni:             string;
  telefono:        string;
  fecha_ingreso:   string;
}

export default function EditPersonalDialog({ isOpen, onClose, onSuccess, personal }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre_completo: "",
    cargo:           "",
    dni:             "",
    telefono:        "",
    fecha_ingreso:   "",
  });

  // Poblar formulario al abrir
  useEffect(() => {
    if (personal) {
      setForm({
        nombre_completo: personal.nombre_completo ?? "",
        cargo:           personal.cargo           ?? "",
        dni:             personal.dni             ?? "",
        telefono:        personal.telefono        ?? "",
        fecha_ingreso:   personal.fecha_ingreso
          ? new Date(personal.fecha_ingreso).toISOString().split("T")[0]
          : "",
      });
    }
  }, [personal]);

  const handleClose = () => onClose();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personal) return;

    // Validación básica
    if (!form.nombre_completo.trim()) {
      toast.error("El nombre completo es requerido");
      return;
    }
    if (form.dni && form.dni.length !== 8) {
      toast.error("El DNI debe tener exactamente 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/personal/${personal.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: form.nombre_completo.trim(),
          cargo:           form.cargo     || undefined,
          dni:             form.dni       ? Number(form.dni)       : undefined,
          telefono:        form.telefono  ? Number(form.telefono)  : undefined,
          fecha_ingreso:   form.fecha_ingreso || undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al actualizar");

      toast.success(`${form.nombre_completo.trim()} actualizado correctamente`);
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] border-none shadow-2xl bg-white p-0 overflow-hidden">

        {/* Franja superior */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 w-full" />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <UserCog className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">
                  Editar Personal
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Modifica solo los datos del colaborador.
                  Para suspender o reactivar usa la acción correspondiente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="edit-personal-form" onSubmit={handleSubmit} className="space-y-4">

            <Field icon={<User className="w-3.5 h-3.5" />} label="Nombre Completo" required>
              <Input
                value={form.nombre_completo}
                onChange={e => setForm(p => ({
                  ...p,
                  nombre_completo: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                }))}
                placeholder="Ej. Carlos Mamani Quispe"
                required
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="Cargo">
                <Select
                  value={form.cargo}
                  onValueChange={v => setForm(p => ({ ...p, cargo: v }))}
                >
                  <SelectTrigger className={`${inputCls} cursor-pointer`}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={<Calendar className="w-3.5 h-3.5" />} label="Fecha Ingreso">
                <Input
                  type="date"
                  value={form.fecha_ingreso}
                  max={new Date().toISOString().split("T")[0]} // No fechas futuras
                  onChange={e => setForm(p => ({ ...p, fecha_ingreso: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Hash className="w-3.5 h-3.5" />} label="DNI">
                <Input
                  value={form.dni}
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="12345678"
                  onChange={e => setForm(p => ({ ...p, dni: e.target.value.replace(/\D/g, "") }))}
                  className={inputCls}
                />
              </Field>

              <Field icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono">
                <Input
                  value={form.telefono}
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="987654321"
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, "") }))}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* ✅ Aviso: el estado NO se edita aquí */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-amber-500 text-xs mt-0.5">⚠</span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                El estado del colaborador (activo / suspendido) se gestiona desde el botón{" "}
                <span className="font-bold">Suspender / Reactivar</span> para mantener la
                sincronización con el acceso al sistema.
              </p>
            </div>

          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-slate-500 hover:bg-slate-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-personal-form"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md px-7 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando…
              </span>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ─────────────────────────────────────────────────
const inputCls =
  "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-emerald-400 transition-all h-10 text-sm";

function Field({ icon, label, required, children }: {
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
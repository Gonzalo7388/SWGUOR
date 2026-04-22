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
import type { PersonalRow } from "./PersonalTable";

const CARGOS: { value: Cargo; label: string }[] = [
  { value: "gerente",              label: "Gerente"         },
  { value: "disenador",            label: "Diseñador"       },
  { value: "cortador",             label: "Cortador"        },
  { value: "recepcionista",        label: "Recepcionista"   },
  { value: "administrador",        label: "Administrador"   },
  { value: "ayudante",             label: "Ayudante"        },
  { value: "representante_taller", label: "Rep. de Taller"  },
];

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  persona:   PersonalRow | null;
}

interface FormState {
  nombre_completo: string;
  cargo:           string;
  dni:             string;
  telefono:        string;
  fecha_ingreso:   string;
  estado:          boolean;
}

export default function EditPersonalDialog({ isOpen, onClose, onSuccess, persona }: Props) {
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState<FormState>({
    nombre_completo: "", cargo: "", dni: "", telefono: "", fecha_ingreso: "", estado: true,
  });

  useEffect(() => {
    if (persona) {
      setForm({
        nombre_completo: persona.nombre_completo ?? "",
        cargo:           persona.cargo           ?? "",
        dni:             persona.dni             ?? "",
        telefono:        persona.telefono        ?? "",
        fecha_ingreso:   persona.fecha_ingreso
          ? new Date(persona.fecha_ingreso).toISOString().split("T")[0]
          : "",
        estado: persona.estado !== false,
      });
    }
  }, [persona]);

  const handleClose = () => { onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/personal", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:              persona.id,
          nombre_completo: form.nombre_completo.trim(),
          cargo:           form.cargo || undefined,
          dni:             form.dni     ? Number(form.dni)     : undefined,
          telefono:        form.telefono ? Number(form.telefono) : undefined,
          fecha_ingreso:   form.fecha_ingreso || undefined,
          estado:          form.estado,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al actualizar");
      toast.success("Personal actualizado correctamente");
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
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 w-full" />

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
                  Actualiza los datos del colaborador.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="edit-personal-form" onSubmit={handleSubmit} className="space-y-4">

            <Field icon={<User className="w-3.5 h-3.5" />} label="Nombre Completo">
              <Input value={form.nombre_completo}
                onChange={e => setForm(p => ({
                  ...p,
                  nombre_completo: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                }))}
                required className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Briefcase className="w-3.5 h-3.5" />} label="Cargo">
                <Select value={form.cargo}
                  onValueChange={v => setForm(p => ({ ...p, cargo: v }))}>
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
                <Input type="date" value={form.fecha_ingreso}
                  onChange={e => setForm(p => ({ ...p, fecha_ingreso: e.target.value }))}
                  className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Hash className="w-3.5 h-3.5" />} label="DNI">
                <Input value={form.dni} inputMode="numeric" maxLength={8}
                  onChange={e => setForm(p => ({ ...p, dni: e.target.value.replace(/\D/g, "") }))}
                  className={inputCls} />
              </Field>
              <Field icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono">
                <Input value={form.telefono} inputMode="numeric" maxLength={12}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, "") }))}
                  className={inputCls} />
              </Field>
            </div>

            {/* Toggle estado */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-sm font-medium text-slate-600">Estado del colaborador</span>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, estado: !p.estado }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.estado ? "bg-emerald-500" : "bg-slate-300"
                }`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.estado ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>

          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={loading}
            className="text-slate-500 hover:bg-slate-100">Cancelar</Button>
          <Button type="submit" form="edit-personal-form" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md px-7">
            {loading
              ? <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando…
                </span>
              : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-emerald-400 transition-all h-10 text-sm";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}
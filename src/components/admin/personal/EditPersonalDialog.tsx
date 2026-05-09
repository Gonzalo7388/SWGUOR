"use client";

import { useEffect, useState } from "react";
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
import { 
  UserCog, Hash, Phone, Briefcase, Calendar, User, 
  X, Loader2, Save, Fingerprint, ShieldAlert, BadgeCheck,
  IdCard, Contact2
} from "lucide-react";
import type { Cargo } from "@prisma/client";
import type { PersonalRow } from "@/lib/services/personal-interno-services";
import { cn } from "@/lib/utils";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personal) return;

    if (!form.nombre_completo.trim()) return toast.error("El nombre es requerido");
    if (form.dni && form.dni.length !== 8) return toast.error("DNI inválido");

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

      toast.success("Perfil actualizado: Información sincronizada con éxito");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] p-0 overflow-hidden rounded-[48px] animate-in zoom-in-95 duration-500">
        
        {/* HEADER PREMIUM */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-800 to-indigo-950 px-10 py-12 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl rotate-3 transition-transform hover:rotate-0">
              <UserCog className="w-8 h-8 text-emerald-400" />
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
               <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="mt-8 space-y-2 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">
              Ajustes de <br /> Colaborador
            </DialogTitle>
            <DialogDescription className="text-emerald-300/60 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-500" /> Gestión de Talento GUOR PRO
            </DialogDescription>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <form id="edit-personal-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 space-y-8">
              <Field icon={<User className="w-4 h-4" />} label="Nombre y Apellidos">
                <Input
                  value={form.nombre_completo}
                  onChange={e => setForm(p => ({
                    ...p,
                    nombre_completo: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                  }))}
                  placeholder="Nombre completo"
                  required
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-6">
                <Field icon={<Briefcase className="w-4 h-4" />} label="Cargo">
                  <Select
                    value={form.cargo}
                    onValueChange={v => setForm(p => ({ ...p, cargo: v }))}
                  >
                    <SelectTrigger className={cn(inputCls, "bg-white")}>
                      <SelectValue placeholder="Seleccionar" />
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

                <Field icon={<Calendar className="w-4 h-4" />} label="Ingreso">
                  <Input
                    type="date"
                    value={form.fecha_ingreso}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(p => ({ ...p, fecha_ingreso: e.target.value }))}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Field icon={<IdCard className="w-4 h-4" />} label="Identificación">
                  <Input
                    value={form.dni}
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="DNI"
                    onChange={e => setForm(p => ({ ...p, dni: e.target.value.replace(/\D/g, "") }))}
                    className={inputCls}
                  />
                </Field>

                <Field icon={<Contact2 className="w-4 h-4" />} label="Contacto">
                  <Input
                    value={form.telefono}
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Celular"
                    onChange={e => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, "") }))}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50/50 border border-amber-100/50 rounded-[24px]">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700/80 font-bold uppercase tracking-wider leading-relaxed">
                La suspensión de acceso se gestiona desde el panel de seguridad para mantener la integridad de las credenciales activas.
              </p>
            </div>
          </form>

          {/* ACCIONES FINALES */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100/50">
            <Button
              type="submit"
              form="edit-personal-form"
              disabled={loading}
              className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sincronizando...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  Guardar Cambios
                  <BadgeCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
              )}
            </Button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
            >
              Cancelar Modificación
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers Premium ──────────────────────────────────────────────────
const inputCls = "bg-white border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-200 focus:shadow-xl focus:shadow-emerald-50/50 focus-visible:ring-0 transition-all h-14 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300";

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
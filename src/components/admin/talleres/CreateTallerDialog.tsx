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
import { Factory, Hash, User, Phone, Mail, MapPin, Wrench, ShieldCheck, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type EstadoTaller       = "activo" | "inactivo" | "suspendido";
type EspecialidadTaller = "corte" | "costura" | "confeccion" | "bordado" | "estampado" | "acabados" | "otro";

interface FormState {
  nombre:       string;
  ruc:          string;
  contacto:     string;
  telefono:     string;
  direccion:    string;
  email:        string;
  especialidad: EspecialidadTaller | null; 
  estado:       EstadoTaller;
}

const INITIAL_FORM: FormState = {
  nombre: "", ruc: "", contacto: "", telefono: "",
  direccion: "", email: "", especialidad: null, estado: "activo",
};

interface CreateTallerDialogProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function CreateTallerDialog({ isOpen, onClose, onSuccess }: CreateTallerDialogProps) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => { setForm(INITIAL_FORM); onClose(); };

  const handleCreate = async () => {
    if (!form.nombre.trim() || !form.ruc.trim() || !form.especialidad) {
      toast.error("Nombre, RUC y especialidad son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("talleres").select("ruc").eq("ruc", form.ruc).maybeSingle();

      if (existing) { toast.error(`El RUC ${form.ruc} ya está registrado`); return; }

      const { error } = await supabase.from("talleres").insert([form]);
      if (error) throw error;

      toast.success("Taller registrado exitosamente");
      onSuccess();
      handleClose();
    } catch {
      toast.error("Error al registrar el taller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] border-none shadow-2xl bg-white p-0 overflow-hidden [&>button]:hidden">

        {/* Franja superior */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-100 shrink-0">
              <Factory className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                Nuevo Taller
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Registra un taller externo de maquila o servicio.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <div className="px-6 pt-5 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={<Factory    className="w-3.5 h-3.5" />} label="Nombre del taller">
            <Input name="nombre"   value={form.nombre}   onChange={handleChange} placeholder="Ej: Taller El Sol" className={inputCls} />
          </Field>
          <Field icon={<Hash       className="w-3.5 h-3.5" />} label="RUC">
            <Input name="ruc"      value={form.ruc}      onChange={handleChange} placeholder="20xxxxxxxxx"       className={inputCls} />
          </Field>
          <Field icon={<User       className="w-3.5 h-3.5" />} label="Contacto">
            <Input name="contacto" value={form.contacto} onChange={handleChange} placeholder="Nombre del responsable" className={inputCls} />
          </Field>
          <Field icon={<Phone      className="w-3.5 h-3.5" />} label="Teléfono">
            <Input name="telefono" value={form.telefono} onChange={handleChange} placeholder="9xx xxx xxx"       className={inputCls} />
          </Field>
          <Field icon={<Mail       className="w-3.5 h-3.5" />} label="Email">
            <Input name="email"    value={form.email}    onChange={handleChange} placeholder="taller@email.com"  className={inputCls} type="email" />
          </Field>
          <Field icon={<MapPin     className="w-3.5 h-3.5" />} label="Dirección">
            <Input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. / Jr. ..."   className={inputCls} />
          </Field>

          <Field icon={<Wrench     className="w-3.5 h-3.5" />} label="Especialidad">
            <Select
              value={form.especialidad ?? ""}
              onValueChange={(v) => setForm(p => ({ ...p, especialidad: v as EspecialidadTaller }))}
            >
              <SelectTrigger className={`${inputCls} cursor-pointer`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {["corte","costura","confeccion","bordado","estampado","acabados","otro"].map(e => (
                  <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Estado">
            <Select value={form.estado} onValueChange={(v) => setForm(p => ({ ...p, estado: v as EstadoTaller }))}>
              <SelectTrigger className={`${inputCls} cursor-pointer`}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading || !form.especialidad}
            className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-100 px-7 transition-all disabled:opacity-50">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registrando…
              </span>
            ) : "Registrar Taller"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

const inputCls = "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-10 text-sm";

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
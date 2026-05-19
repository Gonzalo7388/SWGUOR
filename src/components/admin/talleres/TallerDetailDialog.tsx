"use client";

import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Phone, MapPin, Mail, Hash, Wrench,
  ShieldCheck, Clock, User, Factory, X,
} from "lucide-react";

interface TallerDetailDialogProps {
  isOpen:  boolean;
  taller:  any;
  onClose: () => void;
}

export default function TallerDetailDialog({ isOpen, taller, onClose }: TallerDetailDialogProps) {
  if (!taller) return null;

  const statusConfig: Record<string, { class: string; label: string }> = {
    activo:     { class: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Activo"     },
    inactivo:   { class: "bg-gray-100 text-gray-500 border-gray-200",         label: "Inactivo"   },
    suspendido: { class: "bg-amber-100 text-amber-700 border-amber-200",      label: "Suspendido" },
  };

  const status = statusConfig[taller.estado?.toLowerCase()] ?? statusConfig.inactivo;

  const fields = [
    { icon: Hash,    label: "RUC",         value: taller.ruc,          mono: true  },
    { icon: User,    label: "Contacto",    value: taller.contacto,     mono: false },
    { icon: Phone,   label: "Teléfono",    value: taller.telefono,     mono: true  },
    { icon: Mail,    label: "Email",       value: taller.email,        mono: false },
    { icon: MapPin,  label: "Dirección",   value: taller.direccion,    mono: false },
    { icon: Wrench,  label: "Especialidad",value: taller.especialidad, mono: false },
  ];

  const createdAt = taller.created_at
    ? new Date(taller.created_at).toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] border-none shadow-2xl bg-white p-0 overflow-hidden rounded-2xl [&>button]:hidden">

        {/* Franja superior */}
        <div className="h-2 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-100 shrink-0">
              <Factory className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight leading-tight uppercase">
                {taller.nombre}
              </DialogTitle>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID #{taller.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`${status.class} border shadow-none capitalize font-bold text-xs`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Campos */}
        <div className="px-6 py-2 divide-y divide-slate-100">
          {fields.map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="flex items-center gap-4 py-3">
              <div className="bg-pink-50 p-2 rounded-lg shrink-0 border border-pink-100">
                <Icon className="w-3.5 h-3.5 text-pink-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {label}
                </span>
                <span className={`text-sm font-semibold text-slate-700 truncate capitalize ${mono ? "font-mono tracking-tight" : ""}`}>
                  {value || <span className="text-slate-300 font-normal">—</span>}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 mt-1 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-400 font-medium">
            {createdAt ? `Registrado el ${createdAt}` : "Fecha de registro no disponible"}
          </span>
        </div>

      </DialogContent>
    </Dialog>
  );
}
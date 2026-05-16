"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Hash, Phone, Briefcase, Calendar, Mail,
  ShieldCheck, Clock, AlertCircle,
} from "lucide-react";
import type { PersonalRow } from "@/lib/services/personal-interno.service";

// ─── Helpers ──────────────────────────────────────────────────
const CARGO_LABELS: Record<string, string> = {
  gerente: "Gerente",
  administrador: "Administrador",
  disenador: "Diseñador",
  cortador: "Cortador",
  recepcionista: "Recepcionista",
  ayudante: "Ayudante",
  representante_taller: "Rep. Taller",
};

const CARGO_COLORS: Record<string, string> = {
  gerente: "bg-pink-50 text-pink-700 border-pink-200",
  administrador: "bg-purple-50 text-purple-700 border-purple-200",
  disenador: "bg-teal-50 text-teal-700 border-teal-200",
  cortador: "bg-slate-100 text-slate-600 border-slate-200",
  recepcionista: "bg-blue-50 text-blue-700 border-blue-200",
  ayudante: "bg-amber-50 text-amber-700 border-amber-200",
  representante_taller: "bg-orange-50 text-orange-700 border-orange-200",
};

const ROL_COLORS: Record<string, string> = {
  gerente: "bg-violet-50 text-violet-700 border-violet-200",
  administrador: "bg-sky-50 text-sky-700 border-sky-200",
  recepcionista: "bg-pink-50 text-pink-700 border-pink-200",
  disenador: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  cortador: "bg-orange-50 text-orange-600 border-orange-200",
  representante_taller: "bg-lime-50 text-lime-700 border-lime-200",
  ayudante: "bg-teal-50 text-teal-700 border-teal-200",
};

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function timeAgo(d: string | null | undefined) {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days} días`;
  return formatDate(d);
}

// ─── Props ────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  personal: PersonalRow | null;
}

// ─── Componente ───────────────────────────────────────────────
export default function DetallePersonalDialog({ isOpen, onClose, personal }: Props) {
  if (!personal) return null;

  const cargo = personal.cargo ?? "";
  const iniciales = (personal.nombre_completo ?? personal.usuarios?.email ?? "??")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  const estadoCuenta = personal.usuarios?.estado?.toLowerCase();
  const cuentaActiva = estadoCuenta === "activo";

  // Detectar desincronización: personal activo pero cuenta inactiva o viceversa
  const personalActivo = personal.estado?.toLowerCase() === "activo";
  const desincronizado = personalActivo !== cuentaActiva;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] border-none shadow-2xl bg-white p-0 overflow-hidden">

        {/* Franja teal */}
        <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 w-full" />

        {/* Hero */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalle de Personal</DialogTitle>
            <DialogDescription>Información completa del colaborador</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4">
            {/* Avatar con color según estado */}
            <div className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center font-black text-lg uppercase shrink-0 shadow-sm ${cuentaActiva
                ? "bg-teal-50 border-teal-100 text-teal-600"
                : "bg-slate-100 border-slate-200 text-slate-400"
              }`}>
              {iniciales}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-800 tracking-tight truncate">
                {personal.nombre_completo ?? (
                  <span className="text-slate-400 font-medium text-sm">Sin nombre</span>
                )}
              </h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {personal.usuarios?.email ?? "Sin correo registrado"}
              </p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {/* Badge cargo */}
                {cargo && (
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${CARGO_COLORS[cargo] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                    <Briefcase size={9} className="mr-1" />
                    {CARGO_LABELS[cargo] ?? cargo}
                  </Badge>
                )}

                {/* Badge estado cuenta — única fuente de verdad */}
                <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${cuentaActiva
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-orange-50 text-orange-600 border-orange-200"
                  }`}>
                  {cuentaActiva ? "Activo" : "Suspendido"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Aviso de desincronización (edge case) */}
          {desincronizado && (
            <div className="flex items-start gap-2 mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-600 font-medium">
                Estado inconsistente detectado. Usa Suspender / Reactivar para sincronizar.
              </p>
            </div>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[55vh]">

          {/* ── Datos personales ── */}
          <Section label="Datos Personales">
            <InfoRow icon={<Hash size={13} />} label="DNI"
              value={personal.dni ?? null} mono />
            <InfoRow icon={<Phone size={13} />} label="Teléfono"
              value={personal.telefono ?? null} />
            <InfoRow icon={<Calendar size={13} />} label="Fecha ingreso"
              value={formatDate(personal.fecha_ingreso)} />
          </Section>

          {/* ── Acceso al sistema ── */}
          {personal.usuarios ? (
            <Section label="Acceso al Sistema">
              <InfoRow icon={<Mail size={13} />} label="Email"
                value={personal.usuarios.email} />

              <InfoRow icon={<ShieldCheck size={13} />} label="Rol">
                {personal.usuarios.rol ? (
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ROL_COLORS[personal.usuarios.rol] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                    {personal.usuarios.rol.replace(/_/g, " ")}
                  </Badge>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
              </InfoRow>

              <InfoRow icon={<User size={13} />} label="Estado cuenta">
                <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${cuentaActiva
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-orange-50 text-orange-600 border-orange-200"
                  }`}>
                  {personal.usuarios.estado ?? "—"}
                </Badge>
              </InfoRow>

              <InfoRow icon={<Clock size={13} />} label="Último acceso"
                value={timeAgo(personal.usuarios.ultimo_acceso) ?? "Sin registros"} />
            </Section>
          ) : (
            // Sin usuario vinculado
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700">
                Este colaborador no tiene un usuario de acceso vinculado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <Button variant="ghost" onClick={onClose}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            Cerrar
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">
          {label}
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono, children }: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-300 shrink-0">{icon}</span>
      <span className="text-[11px] font-bold text-slate-400 w-28 shrink-0">{label}</span>
      {children ?? (
        <span className={`text-xs flex-1 min-w-0 truncate ${value ? `text-slate-700 ${mono ? "font-mono" : ""}` : "text-slate-300"
          }`}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}
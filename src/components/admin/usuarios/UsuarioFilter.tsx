"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Cargo, Rol, EstadoUsuario } from "@prisma/client";

// ─── Arrays locales tipados con los enums de Prisma ───────────
const ESTADOS: { value: EstadoUsuario; label: string }[] = [
  { value: "activo",     label: "Activo" },
  { value: "inactivo",   label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

const ROLES: { value: Rol; label: string }[] = [
  { value: "gerente",              label: "Gerente"},
  { value: "administrador",        label: "Administrador" },
  { value: "gerente",              label: "Gerente" },
  { value: "disenador",            label: "Diseñador" },
  { value: "cortador",             label: "Cortador" },
  { value: "ayudante",             label: "Ayudante" },
  { value: "representante_taller", label: "Rep. de Taller" },
  { value: "cliente",              label: "Cliente"},
];

const CARGOS: { value: Cargo; label: string }[] = [
  { value: "gerente",              label: "Gerente" },
  { value: "disenador",            label: "Diseñador" },
  { value: "cortador",             label: "Cortador" },
  { value: "recepcionista",        label: "Recepcionista" },
  { value: "administrador",        label: "Administrador" },
  { value: "ayudante",             label: "Ayudante" },
  { value: "representante_taller", label: "Rep. de Taller" },
];

// ─── Chips: clase Tailwind por campo+valor ────────────────────
const CHIP_CLASS: Record<string, string> = {
  estado_activo:   "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  estado_inactivo: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  rol_admin:       "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  rol_gerente:     "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  rol_vendedor:    "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  rol_almacenero:  "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  rol_disenador:   "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  rol_cortador:    "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  cargo_gerente:   "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  // fallback para cargos sin entrada explícita
  cargo_default:   "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  q:               "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
};

function getChipClass(field: string, value: string): string {
  return CHIP_CLASS[`${field}_${value}`] ?? CHIP_CLASS[`${field}_default`] ?? CHIP_CLASS.q;
}

// ─── Tipos ────────────────────────────────────────────────────
// Renombrado a UsuarioFiltrosState para evitar colisión con el
// nombre del componente exportado (UsuarioFilters).
export interface UsuarioFiltrosState {
  q:      string;
  estado: string;
  rol:    string;
  cargo:  string;
}

interface UsuarioFiltersProps {
  filters:    UsuarioFiltrosState;
  onChange:   (filters: UsuarioFiltrosState) => void;
  totalCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────
export const EMPTY_FILTERS: UsuarioFiltrosState = {
  q: "", estado: "", rol: "", cargo: "",
};

function hasActiveFilters(f: UsuarioFiltrosState) {
  return f.q !== "" || f.estado !== "" || f.rol !== "" || f.cargo !== "";
}

function getLabel(field: "estado" | "rol" | "cargo", value: string): string {
  const map = { estado: ESTADOS, rol: ROLES, cargo: CARGOS } as const;
  return map[field].find((x) => x.value === value)?.label ?? value;
}

// ─── Componente ───────────────────────────────────────────────
export default function UsuarioFilters({
  filters, onChange, totalCount,
}: UsuarioFiltersProps) {

  const set = useCallback(
    (key: keyof UsuarioFiltrosState, value: string) =>
      onChange({ ...filters, [key]: value }),
    [filters, onChange],
  );

  const clear = useCallback(
    (key: keyof UsuarioFiltrosState) => onChange({ ...filters, [key]: "" }),
    [filters, onChange],
  );

  const reset = () => onChange(EMPTY_FILTERS);

  // Chips activos
  const activeChips: {
    key: keyof UsuarioFiltrosState;
    label: string;
    chipClass: string;
  }[] = [];

  if (filters.q)
    activeChips.push({ key: "q",      label: `"${filters.q}"`,                  chipClass: CHIP_CLASS.q });
  if (filters.estado)
    activeChips.push({ key: "estado", label: getLabel("estado", filters.estado), chipClass: getChipClass("estado", filters.estado) });
  if (filters.rol)
    activeChips.push({ key: "rol",    label: getLabel("rol",    filters.rol),    chipClass: getChipClass("rol",    filters.rol) });
  if (filters.cargo)
    activeChips.push({ key: "cargo",  label: getLabel("cargo",  filters.cargo),  chipClass: getChipClass("cargo",  filters.cargo) });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">

      {/* ── Fila principal: search + selects + limpiar ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Buscar por nombre, email o DNI…"
            className="pl-8 h-9 bg-slate-50 border-slate-200 focus:bg-white text-sm transition-colors"
          />
        </div>

        {/* Estado */}
        <Select
          value={filters.estado || "all"}
          onValueChange={(v) => set("estado", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[130px] bg-slate-50 border-slate-200 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rol */}
        <Select
          value={filters.rol || "all"}
          onValueChange={(v) => set("rol", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[145px] bg-slate-50 border-slate-200 text-sm">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cargo */}
        <Select
          value={filters.cargo || "all"}
          onValueChange={(v) => set("cargo", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[145px] bg-slate-50 border-slate-200 text-sm">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cargos</SelectItem>
            {CARGOS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Separador + Limpiar (solo si hay filtros activos) */}
        {hasActiveFilters(filters) && (
          <>
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm px-3"
            >
              Limpiar
            </Button>
          </>
        )}
      </div>

      {/* ── Fila de chips activos + conteo ── */}
      {(activeChips.length > 0 || totalCount >= 0) && (
        <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
          {activeChips.map(({ key, label, chipClass }) => (
            <span
              key={key}
              onClick={() => clear(key)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${chipClass}`}
            >
              {label}
              <X className="w-3 h-3 opacity-60" />
            </span>
          ))}

          <span className="ml-auto text-xs text-slate-400 tabular-nums">
            {totalCount} {totalCount === 1 ? "usuario" : "usuarios"}
          </span>
        </div>
      )}

    </div>
  );
}
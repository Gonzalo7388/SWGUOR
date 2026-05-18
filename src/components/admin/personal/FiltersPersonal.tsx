"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Cargo, EstadoUsuario } from "@prisma/client";

// ─── Arrays locales tipados ───────────────────────────────────
const CARGOS: { value: Cargo; label: string }[] = [
  { value: "gerente", label: "Gerente" },
  { value: "disenador", label: "Diseñador" },
  { value: "cortador", label: "Cortador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "administrador", label: "Administrador" },
  { value: "ayudante", label: "Ayudante" },
  { value: "representante_taller", label: "Rep. de Taller" },
  { value: "almacenero", label: "Almacenero" }
];

const ESTADOS: { value: EstadoUsuario; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

// ─── Chips ────────────────────────────────────────────────────
const CHIP_CLASS: Record<string, string> = {
  estado_activo: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  estado_inactivo: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  cargo_gerente: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  cargo_administrador: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  cargo_disenador: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  cargo_cortador: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  cargo_recepcionista: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  cargo_ayudante: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  cargo_representante_taller: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  cargo_almacenero: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
  q: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
};

function getChipClass(field: string, value: string): string {
  return CHIP_CLASS[`${field}_${value}`] ?? CHIP_CLASS.q;
}

// ─── Tipos ────────────────────────────────────────────────────
export interface PersonalFiltrosState {
  q: string;
  cargo: string;
  estado: string;
}

export const EMPTY_PERSONAL_FILTERS: PersonalFiltrosState = {
  q: "", cargo: "", estado: "",
};

interface PersonalFiltersProps {
  filters: PersonalFiltrosState;
  onChange: (f: PersonalFiltrosState) => void;
  totalCount: number;
}

function hasActive(f: PersonalFiltrosState) {
  return f.q !== "" || f.cargo !== "" || f.estado !== "";
}

function getLabel(field: "cargo" | "estado", value: string): string {
  const map = { cargo: CARGOS, estado: ESTADOS };
  return map[field].find((x) => x.value === value)?.label ?? value;
}

// ─── Componente ───────────────────────────────────────────────
export default function PersonalFilters({ filters, onChange, totalCount }: PersonalFiltersProps) {
  const set = useCallback(
    (key: keyof PersonalFiltrosState, value: string) => onChange({ ...filters, [key]: value }),
    [filters, onChange],
  );
  const clear = (key: keyof PersonalFiltrosState) => onChange({ ...filters, [key]: "" });
  const reset = () => onChange(EMPTY_PERSONAL_FILTERS);

  const chips: { key: keyof PersonalFiltrosState; label: string; chipClass: string }[] = [];
  if (filters.q) chips.push({ key: "q", label: `"${filters.q}"`, chipClass: CHIP_CLASS.q });
  if (filters.cargo) chips.push({ key: "cargo", label: getLabel("cargo", filters.cargo), chipClass: getChipClass("cargo", filters.cargo) });
  if (filters.estado) chips.push({ key: "estado", label: getLabel("estado", filters.estado), chipClass: getChipClass("estado", filters.estado) });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Buscar por nombre, email o DNI…"
            className="pl-8 h-9 bg-slate-50 border-slate-200 focus:bg-white text-sm transition-colors"
          />
        </div>

        <Select value={filters.cargo || "all"} onValueChange={(v) => set("cargo", v === "all" ? "" : v)}>
          <SelectTrigger className="h-9 w-[155px] bg-slate-50 border-slate-200 text-sm">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cargos</SelectItem>
            {CARGOS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.estado || "all"} onValueChange={(v) => set("estado", v === "all" ? "" : v)}>
          <SelectTrigger className="h-9 w-[130px] bg-slate-50 border-slate-200 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive(filters) && (
          <>
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
            <Button type="button" variant="ghost" size="sm" onClick={reset}
              className="h-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm px-3">
              Limpiar
            </Button>
          </>
        )}
      </div>

      {(chips.length > 0 || totalCount >= 0) && (
        <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
          {chips.map(({ key, label, chipClass }) => (
            <span key={key} onClick={() => clear(key)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${chipClass}`}>
              {label}
              <X className="w-3 h-3 opacity-60" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
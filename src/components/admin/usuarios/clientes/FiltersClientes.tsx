"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { EstadoUsuario } from "@prisma/client";

// ─── Arrays locales tipados ───────────────────────────────────
const ESTADOS: { value: EstadoUsuario; label: string }[] = [
  { value: "activo",   label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

// ─── Chips ────────────────────────────────────────────────────
const CHIP_CLASS: Record<string, string> = {
  estado_activo:   "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  estado_inactivo: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
  q:               "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
};

// ─── Tipos ────────────────────────────────────────────────────
export interface ClienteFiltrosState {
  q:      string;
  estado: string;
}

export const EMPTY_CLIENTE_FILTERS: ClienteFiltrosState = {
  q: "", estado: "",
};

interface ClienteFiltersProps {
  filters:    ClienteFiltrosState;
  onChange:   (f: ClienteFiltrosState) => void;
  totalCount: number;
}

function hasActive(f: ClienteFiltrosState) {
  return f.q !== "" || f.estado !== "";
}

// ─── Componente ───────────────────────────────────────────────
export default function ClienteFilters({ filters, onChange, totalCount }: ClienteFiltersProps) {
  const set = useCallback(
    (key: keyof ClienteFiltrosState, value: string) => onChange({ ...filters, [key]: value }),
    [filters, onChange],
  );
  const clear = (key: keyof ClienteFiltrosState) => onChange({ ...filters, [key]: "" });
  const reset = () => onChange(EMPTY_CLIENTE_FILTERS);

  const chips: { key: keyof ClienteFiltrosState; label: string; chipClass: string }[] = [];
  if (filters.q)      chips.push({ key: "q",      label: `"${filters.q}"`,                                           chipClass: CHIP_CLASS.q });
  if (filters.estado) chips.push({ key: "estado", label: ESTADOS.find((e) => e.value === filters.estado)?.label ?? filters.estado, chipClass: CHIP_CLASS[`estado_${filters.estado}`] ?? CHIP_CLASS.q });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Buscar por razón social, RUC o email…"
            className="pl-8 h-9 bg-slate-50 border-slate-200 focus:bg-white text-sm transition-colors"
          />
        </div>

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
          <span className="ml-auto text-xs text-slate-400 tabular-nums">
            {totalCount} {totalCount === 1 ? "cliente" : "clientes"}
          </span>
        </div>
      )}
    </div>
  );
}
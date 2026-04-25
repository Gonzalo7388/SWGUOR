"use client";

import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface FichaFiltrosState {
  q:      string;
  estado: string;
}
export const EMPTY_FICHA_FILTERS: FichaFiltrosState = { q: "", estado: "" };

interface Props {
  filters:    FichaFiltrosState;
  onChange:   (f: FichaFiltrosState) => void;
  totalCount: number;
  onRefresh:  () => void;
  loading?:   boolean;
}

const ESTADOS = [
  { value: "borrador", label: "Borrador" },
  { value: "activo",   label: "Activo"   },
  { value: "revision", label: "Revisión" },
  { value: "obsoleto", label: "Obsoleto" },
];

export default function FichasTecnicasFilters({ filters, onChange, totalCount, onRefresh, loading }: Props) {
  const set = (key: keyof FichaFiltrosState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por producto, SKU o descripción..."
          className="pl-10 h-10 border-gray-200 focus:ring-pink-500 text-sm"
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
        />
      </div>

      <Select value={filters.estado || "all"} onValueChange={(v) => set("estado", v === "all" ? "" : v)}>
        <SelectTrigger className="h-10 w-[150px] bg-slate-50 border-slate-200 text-sm">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {ESTADOS.map((e, i) => (
            <SelectItem key={`estado-${i}`} value={e.value}>{e.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
          {totalCount} {totalCount === 1 ? "ficha" : "fichas"}
        </span>
        <Button variant="outline" size="icon" onClick={onRefresh} className="h-10 w-10 border-slate-200">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
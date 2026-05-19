"use client";

import SearchInput from "../common/SearchInput";
import FilterSelect from "../common/FilterSelect";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlmacenesToolbarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AlmacenesToolbar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isLoading,
  onRefresh,
}: AlmacenesToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <SearchInput
        placeholder="Buscar almacén por nombre o dirección..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      
      <div className="flex items-center gap-3">
        <FilterSelect
          placeholder="Estado"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={[
            { label: "Todos los estados", value: "todos" },
            { label: "Activos", value: "activo" },
            { label: "Inactivos", value: "inactivo" },
          ]}
        />

        <Button
          variant="outline"
          className="h-11 w-11 p-0 border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 text-gray-500", isLoading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}

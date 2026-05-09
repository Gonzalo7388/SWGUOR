"use client";

import SearchInput from "../common/SearchInput";
import FilterSelect from "../common/FilterSelect";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PedidosToolbarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: any) => void;
  onPageReset: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function PedidosToolbar({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  onPageReset,
  isLoading,
  onRefresh,
}: PedidosToolbarProps) {
  const handleSearchChange = (v: string) => {
    setSearchTerm(v);
    onPageReset();
  };

  const handleDateChange = (v: string) => {
    setDateFilter(v);
    onPageReset();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <SearchInput
        placeholder="Buscar por cliente o N° de pedido..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <FilterSelect
          placeholder="Fecha"
          value={dateFilter}
          onValueChange={handleDateChange}
          options={[
            { label: "Cualquier fecha", value: "todas" },
            { label: "Hoy", value: "hoy" },
            { label: "Últimos 7 días", value: "semana" },
            { label: "Este mes", value: "mes" },
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

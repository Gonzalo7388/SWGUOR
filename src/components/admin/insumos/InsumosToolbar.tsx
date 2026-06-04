'use client';

import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIPOS_INSUMO, LISTA_TIPOS_INSUMO } from '@/lib/constants/insumos';

interface InsumosToolbarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  tipoFilter: string;
  onTipoChange: (v: string) => void;
  stockFilter: string;
  onStockChange: (v: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function InsumosToolbar({
  searchTerm,
  onSearchChange,
  tipoFilter,
  onTipoChange,
  stockFilter,
  onStockChange,
  isLoading,
  onRefresh,
}: InsumosToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre..."
          className="pl-10 h-11 bg-white rounded-xl"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={tipoFilter} onValueChange={onTipoChange}>
        <SelectTrigger className="w-full sm:w-44 h-11 bg-white rounded-xl">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los tipos</SelectItem>
          {LISTA_TIPOS_INSUMO.map((key) => (
            <SelectItem key={key} value={key}>
              {TIPOS_INSUMO[key].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={stockFilter} onValueChange={onStockChange}>
        <SelectTrigger className="w-full sm:w-44 h-11 bg-white rounded-xl">
          <SelectValue placeholder="Stock" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todo el stock</SelectItem>
          <SelectItem value="bajo">Bajo stock</SelectItem>
          <SelectItem value="sin">Sin stock</SelectItem>
          <SelectItem value="optimo">Stock óptimo</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={onRefresh}>
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

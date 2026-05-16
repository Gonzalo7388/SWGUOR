'use client';

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditFiltersProps {
  tableFilter: string;
  setTableFilter: (value: string) => void;
  actionFilter: string;
  setActionFilter: (value: string) => void;
  onApplyFilters: () => void;
}

export function AuditFilters({
  tableFilter,
  setTableFilter,
  actionFilter,
  setActionFilter,
  onApplyFilters
}: AuditFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Filtrar por tabla..." 
          className="pl-9 h-11 rounded-xl"
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
        />
      </div>
      <select 
        className="h-11 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
      >
        <option value="">Todas las acciones</option>
        <option value="CREAR">CREAR</option>
        <option value="ACTUALIZAR">ACTUALIZAR</option>
        <option value="ELIMINAR">ELIMINAR</option>
        <option value="LOGIN">LOGIN</option>
        <option value="EXPORTAR">EXPORTAR</option>
      </select>
      <div className="md:col-start-4 flex justify-end">
        <Button 
          variant="outline" 
          className="h-11 rounded-xl gap-2 px-6"
          onClick={onApplyFilters}
        >
          <Filter className="w-4 h-4" /> Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}

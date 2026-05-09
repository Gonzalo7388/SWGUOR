'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

export interface Almacen {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  capacidad_total?: number;
  unidad_capacidad?: string;
  estado: string;
  created_at: string;
}

interface AlmacenesTableProps {
  data: Almacen[];
  onEdit?: (almacen: Almacen) => void;
  isLoading?: boolean;
}

export default function AlmacenesTable({ data, onEdit, isLoading }: AlmacenesTableProps) {
  if (isLoading) {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-50 border-b border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Almacén</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Ubicación</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Capacidad</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Estado</TableHead>
            <TableHead className="text-right font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-gray-400 italic">
                No se encontraron almacenes
              </TableCell>
            </TableRow>
          ) : (
            data.map((almacen) => (
              <TableRow key={almacen.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                      {almacen.nombre}
                    </span>
                    {almacen.descripcion && (
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {almacen.descripcion}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">
                      {almacen.direccion || '—'}
                    </span>
                    {(almacen.telefono || almacen.email) && (
                      <span className="text-[10px] text-slate-400 uppercase font-medium">
                        {almacen.telefono} {almacen.email && `| ${almacen.email}`}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      {almacen.capacidad_total || '0'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {almacen.unidad_capacidad || 'unidades'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={cn(
                      "rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none",
                      almacen.estado === 'activo' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    )}
                  >
                    {almacen.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(almacen)}
                      className="rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-90"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { cn } from '@/lib/utils';
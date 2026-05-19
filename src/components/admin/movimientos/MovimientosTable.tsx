'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlertCircle,
  PackageOpen,
  Boxes,
  Factory,
  User,
  History,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Movimiento {
  id: string;
  producto_id?: string | null;
  insumo_id?: string | null;
  material_id?: string | null;
  cantidad: number;
  motivo?: string | null;
  usuario_id?: string | null;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  referencia_tipo?: 'ORDEN' | 'COMPRA' | 'VENTA' | 'AJUSTE' | null;
  costo_unitario?: number | null;
  stock_anterior?: number | null;
  stock_posterior?: number | null;
  created_at: string;
  updated_at?: string;
  producto?: {
    id: string;
    nombre: string;
  };
  productos?: {
    id: string;
    nombre: string;
  };
  insumo?: {
    id: string;
    nombre: string;
    unidad_medida: string;
  };
  material?: {
    id: string;
    nombre: string;
  };
  materiales?: {
    id: string;
    nombre: string;
  };
  usuario?: {
    id: string;
    nombre: string;
  };
  usuarios?: {
    id: string;
    email: string;
    personal_interno?: { nombre_completo: string }[];
  };
}

interface MovimientosTableProps {
  movimientos: Movimiento[];
  isLoading?: boolean;
}

const TIPO_MOVIMIENTO_CONFIG = {
  entrada: {
    label: 'Entrada',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ArrowUp,
  },
  salida: {
    label: 'Salida',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: ArrowDown,
  },
  ajuste: {
    label: 'Ajuste',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: RotateCcw,
  },
};

const REFERENCIA_CONFIG = {
  ORDEN: { label: 'O/C', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPRA: { label: 'Compra', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  VENTA: { label: 'Venta', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  AJUSTE: { label: 'Ajuste', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function MovimientosTable({
  movimientos,
  isLoading,
}: MovimientosTableProps) {
  const getTipoItem = (mov: Movimiento) => {
    if (mov.producto_id) return { tipo: 'Producto', icon: PackageOpen };
    if (mov.insumo_id) return { tipo: 'Insumo', icon: Boxes };
    if (mov.material_id) return { tipo: 'Material', icon: Factory };
    return { tipo: 'Sistema', icon: AlertCircle };
  };

  const getItemName = (mov: Movimiento) => {
    if (mov.productos) return mov.productos.nombre;
    if (mov.producto)  return mov.producto.nombre;
    if (mov.insumo)    return mov.insumo.nombre;
    if (mov.materiales) return mov.materiales.nombre;
    if (mov.material)   return mov.material.nombre;
    return 'Desconocido';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha / Hora</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Artículo</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cant.</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Previo</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Post</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref.</TableHead>
            <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <History className="w-8 h-8 text-gray-300" />
                  <span className="text-gray-400 italic text-sm">No hay movimientos registrados</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            movimientos.map((mov) => {
              const tipoItem = getTipoItem(mov);
              const config = TIPO_MOVIMIENTO_CONFIG[mov.tipo_movimiento];
              const Icon = config.icon;
              const ItemIcon = tipoItem.icon;

              return (
                <TableRow key={mov.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(mov.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 w-fit border ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                              <ItemIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                              {getItemName(mov)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3 shadow-xl">
                          <p className="text-xs font-bold">{getItemName(mov)}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{tipoItem.tipo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="py-4 px-5 text-right font-black text-slate-900 text-sm">
                    {mov.cantidad}
                  </TableCell>
                  <TableCell className="py-4 px-5 text-center text-xs text-slate-400">
                    {mov.stock_anterior != null ? mov.stock_anterior.toFixed(1) : '—'}
                  </TableCell>
                  <TableCell className="py-4 px-5 text-center text-xs font-bold text-slate-600">
                    {mov.stock_posterior != null ? mov.stock_posterior.toFixed(1) : '—'}
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    {mov.referencia_tipo && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter border ${REFERENCIA_CONFIG[mov.referencia_tipo as keyof typeof REFERENCIA_CONFIG]?.color || 'bg-gray-50'}`}>
                        {REFERENCIA_CONFIG[mov.referencia_tipo as keyof typeof REFERENCIA_CONFIG]?.label || mov.referencia_tipo}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs max-w-[150px] truncate">
                       {mov.motivo || '—'}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

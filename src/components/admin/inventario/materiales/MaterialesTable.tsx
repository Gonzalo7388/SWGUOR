'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Edit3, Trash2, XCircle } from 'lucide-react';

interface Props {
  data:      any[];
  loading:   boolean;
  onEdit:    (item: any) => void;
  onDelete:  (item: any) => void;
  canEdit:   boolean;
  canDelete: boolean;
}

export default function MaterialesTable({ data, loading, onEdit, onDelete, canEdit, canDelete }: Props) {

  function stockBadge(m: any) {
    const actual  = Number(m.stock_actual);
    const minimo  = Number(m.stock_minimo);
    if (actual <= 0)       return <Badge className="bg-red-100 text-red-700 border-red-200 font-bold text-[10px]"><XCircle className="w-3 h-3 mr-1" />SIN STOCK</Badge>;
    if (actual <= minimo)  return <Badge className="bg-orange-100 text-orange-700 border-orange-200 font-bold text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />STOCK BAJO</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px]">ÓPTIMO</Badge>;
  }

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando materiales...</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="h-48 flex flex-col items-center justify-center bg-white rounded-xl border text-gray-400">
      <XCircle className="w-10 h-10 mb-2 opacity-30" />
      <p className="font-bold text-sm uppercase tracking-widest">Sin resultados</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b">
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500 py-3">Material / Composición</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500">Tipo</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500">Color</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500">Gramaje</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500 text-right">Stock Actual</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500 text-right">Precio Est.</TableHead>
            <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500 text-center">Estado</TableHead>
            {(canEdit || canDelete) && (
              <TableHead className="font-black text-[11px] uppercase tracking-wider text-gray-500 text-center">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m: any) => (
            <TableRow key={m.id} className="hover:bg-gray-50 transition-colors border-b last:border-0">

              {/* Nombre + composición */}
              <TableCell className="py-3">
                <div className="font-bold text-gray-900 text-sm">{m.nombre}</div>
                {m.composicion && (
                  <div className="text-xs text-gray-400 mt-0.5">{m.composicion}</div>
                )}
                {m.proveedor && (
                  <div className="text-[10px] text-pink-500 font-semibold mt-0.5">
                    {m.proveedor.razon_social ?? m.proveedor}
                  </div>
                )}
              </TableCell>

              {/* Tipo */}
              <TableCell>
                <span className="capitalize text-sm text-gray-700 font-medium">{m.tipo ?? '—'}</span>
              </TableCell>

              {/* Color */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {m.codigo_color && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: m.codigo_color }}
                    />
                  )}
                  <span className="text-sm text-gray-700">{m.color || '—'}</span>
                </div>
              </TableCell>

              {/* Gramaje */}
              <TableCell>
                <span className="text-sm text-gray-700">
                  {m.gramaje ? `${m.gramaje} g/m²` : '—'}
                </span>
              </TableCell>

              {/* Stock */}
              <TableCell className="text-right">
                <span className={`text-sm font-bold ${Number(m.stock_actual) <= Number(m.stock_minimo) ? 'text-red-600' : 'text-gray-900'}`}>
                  {m.stock_actual}
                </span>
                <span className="text-xs text-gray-400 ml-1">{m.unidad_medida ?? 'm'}</span>
              </TableCell>

              {/* Precio */}
              <TableCell className="text-right">
                <span className="text-sm font-bold text-gray-900">
                  S/ {Number(m.precio_unitario ?? 0).toFixed(2)}
                </span>
              </TableCell>

              {/* Estado */}
              <TableCell className="text-center">
                {stockBadge(m)}
              </TableCell>

              {/* Acciones */}
              {(canEdit || canDelete) && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => onEdit(m)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => onDelete(m)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
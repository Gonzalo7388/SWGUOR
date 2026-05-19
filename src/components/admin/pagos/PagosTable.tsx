'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Pago {
  id_uuid: string;
  pedido_id: number;
  monto: number;
  metodo_pago: string;
  fecha_pago: string;
  comprobante_url?: string | null;
  notas?: string | null;
  usuario_id?: number | null;
  tipo: string;
  estado: string;
  verificado_at?: string | null;
  verificado_por?: number | null;
  created_at: string;
  pedidos?: {
    id: number;
    estado: string;
    total: number;
    monto_pagado: number;
    saldo_pendiente: number;
    clientes?: {
      id: number;
      razon_social: string;
      ruc: string;
    } | null;
  };
  usuario?: { id: number; nombre_completo: string } | null;
  verificado_por_usuario?: { id: number; nombre_completo: string } | null;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente',  color: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Clock },
  verificado: { label: 'Verificado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rechazado:  { label: 'Rechazado',  color: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
};

const METODO_LABELS: Record<string, string> = {
  efectivo:          'Efectivo',
  transferencia_bcp: 'Transferencia BCP',
  yape:              'Yape',
  plin:              'Plin',
  visa:              'Visa',
  mastercard:        'Mastercard',
};

const TIPO_LABELS: Record<string, string> = {
  adelanto:      'Adelanto',
  cuota:         'Cuota',
  saldo_final:   'Saldo Final',
  pago_completo: 'Pago Completo',
};

interface PagosTableProps {
  data: Pago[];
  isLoading?: boolean;
  onView?: (pago: Pago) => void;
  onVerify?: (pago: Pago) => void;
}

function formatMoney(value: number | string | null | undefined) {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PagosTable({ data, isLoading, onView, onVerify }: PagosTableProps) {
  if (isLoading) {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
        {[...Array(6)].map((_, i) => (
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
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Pedido / Cliente</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Monto</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Tipo</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Método</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Fecha</TableHead>
            <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Estado</TableHead>
            <TableHead className="text-right font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2">
                  <DollarSign className="w-8 h-8 text-gray-300" />
                  <span className="text-gray-400 italic text-sm">No se encontraron pagos registrados</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((pago) => {
              const est = ESTADO_CONFIG[pago.estado] ?? ESTADO_CONFIG.pendiente;
              const EstIcon = est.icon;
              return (
                <TableRow key={pago.id_uuid} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Pedido #{pago.pedido_id}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {pago.pedidos?.clientes?.razon_social ?? 'Sin cliente'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold text-slate-800">{formatMoney(pago.monto)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200">
                      {TIPO_LABELS[pago.tipo] ?? pago.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-600">
                      {METODO_LABELS[pago.metodo_pago] ?? pago.metodo_pago}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{formatDate(pago.fecha_pago)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 w-fit', est.color)}>
                      <EstIcon className="w-3 h-3" />
                      {est.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onView && (
                        <Button variant="ghost" size="sm" onClick={() => onView(pago)}
                          className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onVerify && pago.estado === 'pendiente' && (
                        <Button variant="ghost" size="sm" onClick={() => onVerify(pago)}
                          className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
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

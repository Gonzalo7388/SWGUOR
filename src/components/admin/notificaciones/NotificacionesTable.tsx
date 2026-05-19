'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Bell, Inbox } from 'lucide-react';
import type { Notificacion } from '@/lib/schemas/notificaciones';
import { TipoNotificacion } from '@prisma/client';

const TIPO_CONFIG: Record<TipoNotificacion, { label: string; color: string }> = {
  stock_bajo: { label: 'Stock bajo', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  pedido_vencido: { label: 'Pedido vencido', color: 'bg-red-50 text-red-700 border-red-200' },
  pago_pendiente: { label: 'Pago pendiente', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  cotizacion_expirada: { label: 'Cotización expirada', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  orden_produccion: { label: 'Orden producción', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  confeccion_completada: { label: 'Confección completada', color: 'bg-green-50 text-green-700 border-green-200' },
  devolucion_solicitada: { label: 'Devolución solicitada', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  sistema: { label: 'Sistema', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export default function NotificacionesTable({ data = [] }: { data: Notificacion[] }) {
  const [search, setSearch] = useState('');

  const filtered = data.filter(({ titulo, mensaje }) => {
    const q = search.toLowerCase();
    return titulo.toLowerCase().includes(q) || mensaje.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por título o mensaje..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-indigo-400 transition-all"
        />
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</TableHead>
              <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Información</TableHead>
              <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</TableHead>
              <TableHead className="py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 text-gray-200" />
                    <span className="text-gray-400 italic text-sm">No hay notificaciones</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((n) => {
              const conf = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG.sistema;
              return (
                <TableRow key={n.id} className={`group hover:bg-slate-50/50 transition-colors ${n.leido ? 'opacity-50' : ''}`}>
                  <TableCell className="py-4 px-5">
                    {n.leido
                      ? <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-lg border-slate-200 text-slate-400">Leída</Badge>
                      : <Badge className="text-[10px] uppercase font-bold tracking-wider rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-100">Nueva</Badge>
                    }
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{n.titulo}</span>
                      <p className="text-xs text-slate-500 max-w-md line-clamp-1">{n.mensaje}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${conf.color}`}>
                      {conf.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-5 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
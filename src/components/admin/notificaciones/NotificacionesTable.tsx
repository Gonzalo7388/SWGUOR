'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Notificacion } from '@/lib/schemas/notificacionesSchema';
import { TipoNotificacion } from '@prisma/client';

const TIPO_BADGE: Record<TipoNotificacion, string> = {
  stock_bajo:            'bg-orange-100 text-orange-800',
  pedido_vencido:        'bg-red-100 text-red-800',
  pago_pendiente:        'bg-rose-100 text-rose-800',
  cotizacion_expirada:   'bg-yellow-100 text-yellow-800',
  orden_produccion:      'bg-blue-100 text-blue-800',
  confeccion_completada: 'bg-green-100 text-green-800',
  devolucion_solicitada: 'bg-purple-100 text-purple-800',
  sistema:               'bg-slate-100 text-slate-700',
};

const TIPO_LABEL: Record<TipoNotificacion, string> = {
  stock_bajo:            'Stock bajo',
  pedido_vencido:        'Pedido vencido',
  pago_pendiente:        'Pago pendiente',
  cotizacion_expirada:   'Cotización expirada',
  orden_produccion:      'Orden producción',
  confeccion_completada: 'Confección completada',
  devolucion_solicitada: 'Devolución solicitada',
  sistema:               'Sistema',
};

export default function NotificacionesTable({ data = [] }: { data: Notificacion[] }) {
  const [search, setSearch] = useState('');

  const filtered = data.filter(({ titulo, mensaje }) => {
    const q = search.toLowerCase();
    return titulo.toLowerCase().includes(q) || mensaje.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar notificaciones..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead className="w-[180px]">Tipo</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                  Sin notificaciones
                </TableCell>
              </TableRow>
            ) : filtered.map((n) => (
              <TableRow key={n.id} className={n.leido ? 'opacity-60' : ''}>
                <TableCell>
                  {n.leido
                    ? <Badge variant="outline">Leída</Badge>
                    : <Badge variant="destructive">Nueva</Badge>
                  }
                </TableCell>
                <TableCell className="font-semibold">{n.titulo}</TableCell>
                <TableCell className="max-w-md text-sm text-slate-600">{n.mensaje}</TableCell>
                <TableCell>
                  <Badge className={TIPO_BADGE[n.tipo]}>{TIPO_LABEL[n.tipo]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {new Date(n.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
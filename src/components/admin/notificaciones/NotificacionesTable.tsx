'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, CheckCircle } from 'lucide-react';

interface Notificacion {
  id: string;
  tipo: 'inventario' | 'orden' | 'urgente' | 'pago' | 'info' | 'success'; // Unificamos tipos
  titulo: string;
  descripcion: string; // Tu API usa descripcion, no mensaje
  importante: boolean;
  fecha: string;
}

interface NotificacionesTableProps {
  data: Notificacion[];
}

export default function NotificacionesTable({ data = [] }: { data: Notificacion[] }) {
  const [search, setSearch] = useState('');

  // Filtrado robusto
  const filteredData = (Array.isArray(data) ? data : []).filter(item => {
    const busqueda = search.toLowerCase();
    const titulo = item.titulo?.toLowerCase() || '';
    const desc = item.descripcion?.toLowerCase() || '';
    
    return titulo.includes(busqueda) || desc.includes(busqueda);
  });

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, string> = {
      inventario: 'bg-orange-100 text-orange-800',
      pago: 'bg-red-100 text-red-800',
      urgente: 'bg-rose-100 text-rose-800',
      orden: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[tipo] || 'bg-gray-100'}>{tipo.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar alertas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prioridad</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((notif) => (
              <TableRow key={notif.id}>
                <TableCell>
                  {notif.importante ? (
                    <Badge variant="destructive">Alta</Badge>
                  ) : (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold">{notif.titulo}</TableCell>
                <TableCell className="max-w-md">{notif.descripcion}</TableCell>
                <TableCell>{getTipoBadge(notif.tipo)}</TableCell>
                <TableCell>
                  {new Date(notif.fecha).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
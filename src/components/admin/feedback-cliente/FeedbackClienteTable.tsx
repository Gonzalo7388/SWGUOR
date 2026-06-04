'use client';

import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Edit, CheckCircle2, Clock3, Package } from 'lucide-react';

export interface FeedbackClienteRecord {
  id: number | string;
  cliente_id: number | string;
  pedido_id?: number | string | null;
  puntuacion: number;
  calidad_producto?: number | null;
  tiempo_entrega?: number | null;
  atencion_personal?: number | null;
  comentarios?: string | null;
  recomendaria?: boolean | null;
  canal?: string | null;
  estado?: 'pendiente' | 'revisado' | null;
  created_at: string;
  clientes: {
    razon_social?: string | null;
    nombre_comercial?: string | null;
    ruc?: string | null;
    email?: string | null;
  };
  pedidos?: { estado?: string | null } | null;
}

interface FeedbackClienteTableProps {
  data: FeedbackClienteRecord[];
  loading?: boolean;
  onEdit?: (feedback: FeedbackClienteRecord) => void;
}

export default function FeedbackClienteTable({ data, loading, onEdit }: FeedbackClienteTableProps) {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [recomiendaFilter, setRecomiendaFilter] = useState<string>('all');

  const filteredData = useMemo(() => data.filter((item) => {
    const clienteNombre = item.clientes.razon_social ?? item.clientes.nombre_comercial ?? item.clientes.email ?? '';
    const matchesSearch =
      clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      item.comentarios?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.pedido_id ?? '').includes(search.toLowerCase()) ||
      item.canal?.toLowerCase().includes(search.toLowerCase());

    const matchesEstado = estadoFilter === 'all' || (item.estado ?? 'pendiente') === estadoFilter;
    const matchesRecomienda = recomiendaFilter === 'all'
      || (recomiendaFilter === 'si' && item.recomendaria === true)
      || (recomiendaFilter === 'no' && item.recomendaria === false);

    return matchesSearch && matchesEstado && matchesRecomienda;
  }), [data, search, estadoFilter, recomiendaFilter]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getEstadoBadge = (estado?: string | null) => {
    if (estado === 'revisado') {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Revisado</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pendiente</Badge>;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 5) return 'Excelente';
    if (score >= 4) return 'Muy bueno';
    if (score >= 3) return 'Aceptable';
    if (score >= 2) return 'Bajo';
    return 'Crítico';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr_0.8fr] gap-3">
        <Input
          placeholder="Buscar por cliente, pedido, comentario o canal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-xl"
        />
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="revisado">Revisado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={recomiendaFilter} onValueChange={setRecomiendaFilter}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="¿Recomienda?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="si">Sí</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
              <TableHead>Cliente</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Atención</TableHead>
              <TableHead>Recomienda</TableHead>
              <TableHead>Observación</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center text-slate-400">
                  Cargando feedback de clientes...
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-900">
                      {feedback.clientes.razon_social ?? feedback.clientes.nombre_comercial ?? 'Cliente sin nombre'}
                    </div>
                    <div className="text-sm text-muted-foreground">{feedback.clientes.email ?? 'Sin correo'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {feedback.pedido_id ? (
                    <div>
                      <div>#{feedback.pedido_id}</div>
                      <Badge variant="outline">{feedback.pedidos?.estado ?? '—'}</Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sin pedido</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.puntuacion)}
                      <span className="ml-2 text-sm font-semibold">({feedback.puntuacion}/5)</span>
                    </div>
                    <p className="text-xs text-slate-400">{getScoreLabel(feedback.puntuacion)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-300" />
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.calidad_producto ?? feedback.puntuacion)}
                      <span className="text-xs text-slate-500">{feedback.calidad_producto ?? feedback.puntuacion}/5</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4 text-slate-300" />
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.tiempo_entrega ?? feedback.puntuacion)}
                      <span className="text-xs text-slate-500">{feedback.tiempo_entrega ?? feedback.puntuacion}/5</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-300" />
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.atencion_personal ?? feedback.puntuacion)}
                      <span className="text-xs text-slate-500">{feedback.atencion_personal ?? feedback.puntuacion}/5</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={feedback.recomendaria ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                    {feedback.recomendaria ? 'Sí' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {feedback.comentarios ? (
                    <div className="max-w-xs truncate" title={feedback.comentarios}>
                      {feedback.comentarios}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sin observación</span>
                  )}
                </TableCell>
                <TableCell>{feedback.canal ?? '—'}</TableCell>
                <TableCell>{getEstadoBadge(feedback.estado)}</TableCell>
                <TableCell>
                  {new Date(feedback.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(feedback)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron registros de feedback
        </div>
      )}
    </div>
  );
}
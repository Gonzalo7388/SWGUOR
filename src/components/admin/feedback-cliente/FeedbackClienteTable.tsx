'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Edit } from 'lucide-react';

interface Feedback {
  id: number;
  cliente_id: number;
  pedido_id?: number;
  puntuacion: number;
  comentario?: string;
  tipo_feedback: 'positivo' | 'negativo' | 'sugerencia';
  created_at: string;
  clientes: { nombre: string; email: string };
  pedidos?: { estado: string };
}

interface FeedbackClienteTableProps {
  data: Feedback[];
  onEdit?: (feedback: Feedback) => void;
}

export default function FeedbackClienteTable({ data, onEdit }: FeedbackClienteTableProps) {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');

  const filteredData = data.filter(item => {
    const matchesSearch = item.clientes.nombre.toLowerCase().includes(search.toLowerCase()) ||
                         item.comentario?.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = !tipoFilter || item.tipo_feedback === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      positivo: 'bg-green-100 text-green-800',
      negativo: 'bg-red-100 text-red-800',
      sugerencia: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={variants[tipo as keyof typeof variants] || 'bg-gray-100'}>{tipo}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por cliente o comentario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="positivo">Positivo</SelectItem>
            <SelectItem value="negativo">Negativo</SelectItem>
            <SelectItem value="sugerencia">Sugerencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{feedback.clientes.nombre}</div>
                    <div className="text-sm text-muted-foreground">{feedback.clientes.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {feedback.pedido_id ? (
                    <div>
                      <div>#{feedback.pedido_id}</div>
                      <Badge variant="outline">{feedback.pedidos?.estado}</Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sin pedido</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {renderStars(feedback.puntuacion)}
                    <span className="ml-2 text-sm">({feedback.puntuacion}/5)</span>
                  </div>
                </TableCell>
                <TableCell>{getTipoBadge(feedback.tipo_feedback)}</TableCell>
                <TableCell>
                  {feedback.comentario ? (
                    <div className="max-w-xs truncate" title={feedback.comentario}>
                      {feedback.comentario}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sin comentario</span>
                  )}
                </TableCell>
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
          No se encontraron feedbacks
        </div>
      )}
    </div>
  );
}
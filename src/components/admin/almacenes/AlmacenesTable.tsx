'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

interface Almacen {
  id: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  capacidad_maxima?: number;
  estado: 'activo' | 'inactivo';
  created_at: string;
}

interface AlmacenesTableProps {
  data: Almacen[];
  onEdit?: (almacen: Almacen) => void;
}

export default function AlmacenesTable({ data, onEdit }: AlmacenesTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Capacidad Máxima</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((almacen) => (
            <TableRow key={almacen.id}>
              <TableCell className="font-medium">{almacen.nombre}</TableCell>
              <TableCell>
                {almacen.descripcion ? (
                  <div className="max-w-xs truncate" title={almacen.descripcion}>
                    {almacen.descripcion}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sin descripción</span>
                )}
              </TableCell>
              <TableCell>
                {almacen.ubicacion || <span className="text-muted-foreground">No especificada</span>}
              </TableCell>
              <TableCell>
                {almacen.capacidad_maxima ? almacen.capacidad_maxima : 'Sin límite'}
              </TableCell>
              <TableCell>
                <Badge className={almacen.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {almacen.estado}
                </Badge>
              </TableCell>
              <TableCell>
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(almacen)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
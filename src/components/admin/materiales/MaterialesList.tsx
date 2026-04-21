'use client';

import { useState } from 'react';
import { useMateriales } from '@/lib/hooks/useMateriales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, AlertTriangle, Edit3 } from 'lucide-react';

export function MaterialesList() {
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('todos');
  
  const { materiales, isLoading } = useMateriales({ 
    busqueda, 
    tipo: tipo !== 'todos' ? tipo : undefined 
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, color o composición..."
              className="pl-8"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-md px-3 text-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="plano">Tejido Plano</option>
            <option value="punto">Tejido de Punto</option>
            <option value="insumo">Insumo / Avío</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Material
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre / Composición</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Stock Actual</TableHead>
              <TableHead className="text-right">Precio Est.</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Cargando materiales...</TableCell></TableRow>
            ) : materiales.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">No se encontraron materiales</TableCell></TableRow>
            ) : (
              materiales.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.nombre}</div>
                    <div className="text-xs text-muted-foreground">{m.composicion || '-'}</div>
                  </TableCell>
                  <TableCell className="capitalize">{m.tipo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {m.codigo_color && (
                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: m.codigo_color }} />
                      )}
                      {m.color}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {Number(m.stock_actual) <= Number(m.stock_minimo) && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={Number(m.stock_actual) <= Number(m.stock_minimo) ? "text-destructive font-bold" : ""}>
                        {m.stock_actual} {m.unidad_medida}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">S/ {m.precio_unitario || '0.00'}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { toast } from 'sonner';
import AlmacenesTable from '@/components/admin/almacenes/AlmacenesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AlmacenDialog from '@/components/admin/almacenes/AlmacenDialog';

interface Almacen {
  id: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  capacidad_maxima?: number;
  estado: 'activo' | 'inactivo';
  created_at: string;
}

export default function AlmacenesPage() {
  const { can } = usePermissions();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);

  const loadAlmacenes = async () => {
    try {
      const res = await fetch('/api/admin/almacenes');
      if (!res.ok) throw new Error('Error al cargar almacenes');
      const data = await res.json();
      setAlmacenes(data);
    } catch (error) {
      toast.error('Error al cargar almacenes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (can('view', 'almacenes')) {
      loadAlmacenes();
    } else {
      setLoading(false);
    }
  }, [can]);

  const handleCreate = () => {
    setEditingAlmacen(null);
    setDialogOpen(true);
  };

  const handleEdit = (almacen: Almacen) => {
    setEditingAlmacen(almacen);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const method = editingAlmacen ? 'PUT' : 'POST';
      const url = editingAlmacen
        ? `/api/admin/almacenes/${editingAlmacen.id}`
        : '/api/admin/almacenes';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar');

      toast.success(editingAlmacen ? 'Almacén actualizado' : 'Almacén creado');
      setDialogOpen(false);
      loadAlmacenes();
    } catch (error) {
      toast.error('Error al guardar almacén');
      console.error(error);
    }
  };

  if (!can('view', 'almacenes')) {
    return <div className="p-6">Acceso denegado</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Almacenes</h1>
          <p className="text-muted-foreground">Gestiona los almacenes del sistema</p>
        </div>
        {can('create', 'almacenes') && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Almacén
          </Button>
        )}
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <AlmacenesTable
          data={almacenes}
          onEdit={can('edit', 'almacenes') ? handleEdit : undefined}
        />
      )}

      <AlmacenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        almacen={editingAlmacen}
      />
    </div>
  );
}
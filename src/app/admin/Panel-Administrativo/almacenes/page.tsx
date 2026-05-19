'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { toast } from 'sonner';
import AlmacenesTable, { Almacen } from '@/components/admin/almacenes/AlmacenesTable';
import AlmacenFormModal from '@/components/admin/almacenes/AlmacenFormModal';
import { AlmacenDeleteModal } from '@/components/admin/almacenes/AlmacenModals';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import StatCard from '@/components/admin/common/StatCard';
import AlmacenesToolbar from '@/components/admin/almacenes/AlmacenesToolbar';
import { Layout, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

export default function AlmacenesPage() {
  const { can } = usePermissions();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);
  const [deleteAlmacen, setDeleteAlmacen] = useState<Almacen | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const loadAlmacenes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/almacenes');
      if (!res.ok) throw new Error('Error al cargar almacenes');
      const data = await res.json();
      setAlmacenes(data);
    } catch (error) {
      toast.error('Error al conectar con la base de datos de almacenes');
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

  const stats = useMemo(() => {
    const total = almacenes.length;
    const activos = almacenes.filter(a => a.estado === 'activo').length;
    const inactivos = total - activos;
    const capacidadTotal = almacenes.reduce((acc, a) => acc + Number(a.capacidad_total || 0), 0);
    return { total, activos, inactivos, capacidadTotal };
  }, [almacenes]);

  const filteredAlmacenes = useMemo(() => {
    return almacenes.filter(a => {
      const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (a.direccion?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'todos' || a.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [almacenes, searchTerm, statusFilter]);

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

  const handleDelete = (almacen: Almacen) => {
    setDeleteAlmacen(almacen);
  };

  if (!can('view', 'almacenes')) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Acceso Denegado</h1>
        <p className="text-gray-500">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Almacenes"
          description="Gestión integral de centros de distribución y depósitos"
          actionLabel="Nuevo Almacén"
          onAction={can('create', 'almacenes') ? handleCreate : undefined}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Almacenes"
            value={stats.total}
            icon={Layout}
            color="slate"
            isActive={statusFilter === 'todos'}
            onClick={() => setStatusFilter('todos')}
          />
          <StatCard
            title="Activos"
            value={stats.activos}
            icon={CheckCircle2}
            color="emerald"
            isActive={statusFilter === 'activo'}
            onClick={() => setStatusFilter('activo')}
          />
          <StatCard
            title="Inactivos"
            value={stats.inactivos}
            icon={XCircle}
            color="orange"
            isActive={statusFilter === 'inactivo'}
            onClick={() => setStatusFilter('inactivo')}
          />
          <StatCard
            title="Capacidad Total"
            value={stats.capacidadTotal.toLocaleString()}
            icon={BarChart3}
            color="blue"
            disabled
          />
        </div>

        <AlmacenesToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isLoading={loading}
          onRefresh={loadAlmacenes}
        />

        <AlmacenesTable
          data={filteredAlmacenes}
          isLoading={loading}
          onEdit={can('edit', 'almacenes') ? handleEdit : undefined}
          onDelete={can('archive', 'almacenes') ? handleDelete : undefined}
        />
      </div>

      {dialogOpen && (
        <AlmacenFormModal
          almacen={editingAlmacen}
          onClose={() => setDialogOpen(false)}
          onSuccess={loadAlmacenes}
        />
      )}

      {deleteAlmacen && (
        <AlmacenDeleteModal
          almacen={deleteAlmacen}
          onClose={() => setDeleteAlmacen(null)}
          onSuccess={loadAlmacenes}
        />
      )}
    </div>
  );
}
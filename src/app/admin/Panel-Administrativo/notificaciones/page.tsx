'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { toast } from 'sonner';
import NotificacionesTable from '@/components/admin/notificaciones/NotificacionesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NotificacionDialog from '@/components/admin/notificaciones/NotificacionDialog';

interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  created_at: string;
  usuarios: { nombre: string };
}

export default function NotificacionesPage() {
  const { can } = usePermissions();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadNotificaciones = async () => {
    try {
      const res = await fetch('/api/admin/notificaciones');
      if (!res.ok) throw new Error('Error al cargar');
      
      const response = await res.json();

      // IMPORTANTE: Extraemos 'data' del objeto de la respuesta
      // La respuesta de tu API es { data: [...], kpis: {}, count: 0 }
      if (response && Array.isArray(response.data)) {
        setNotificaciones(response.data);
      } else {
        setNotificaciones([]);
      }

    } catch (error) {
      toast.error('Error al cargar notificaciones');
      console.error(error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (can('view', 'notificaciones')) {
      loadNotificaciones();
    } else {
      setLoading(false);
    }
  }, [can]);

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const res = await fetch('/api/admin/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar');

      toast.success('Notificación enviada');
      setDialogOpen(false);
      loadNotificaciones();
    } catch (error) {
      toast.error('Error al enviar notificación');
      console.error(error);
    }
  };

  if (!can('view', 'notificaciones')) {
    return <div className="p-6">Acceso denegado</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona las notificaciones del sistema</p>
        </div>
        {can('create', 'notificaciones') && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Notificación
          </Button>
        )}
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <NotificacionesTable data={notificaciones} />
      )}

      <NotificacionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
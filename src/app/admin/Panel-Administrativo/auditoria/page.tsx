'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import { History } from 'lucide-react';
import { toast } from 'sonner';

// Componentes Modulares
import { AuditFilters } from '@/components/admin/auditoria/AuditFilters';
import { AuditTable } from '@/components/admin/auditoria/AuditTable';
import { AuditDetailModal } from '@/components/admin/auditoria/AuditDetailModal';
import { AuditLog } from '@/components/admin/auditoria/types';

export default function AuditoriaPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filtros y Paginación
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (tableFilter) params.set('table', tableFilter);
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/admin/auditoria?${params}`);
      if (!res.ok) throw new Error('Error al cargar logs');
      
      const data = await res.json();
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('No se pudo cargar el historial de auditoría');
    } finally {
      setLoading(false);
    }
  }, [tableFilter, actionFilter]);

  useEffect(() => {
    if (can('view', 'usuarios')) {
      fetchLogs();
    }
  }, [can, fetchLogs]);

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-black uppercase tracking-widest animate-pulse">Sincronizando Auditoría...</p>
      </div>
    );
  }

  if (!can('view', 'usuarios')) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50 text-center p-6">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-500 max-w-sm mt-2">No cuentas con permisos para visualizar los registros de auditoría.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AdminPageHeader
          title="Registro de Auditoría"
          description="Historial completo de acciones y cambios realizados en el sistema"
          icon={History}
        />

        {/* Filtros Separados */}
        <AuditFilters 
          tableFilter={tableFilter}
          setTableFilter={setTableFilter}
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          onApplyFilters={() => fetchLogs(1)}
        />

        {/* Tabla Separada */}
        <AuditTable 
          logs={logs}
          loading={loading}
          pagination={pagination}
          onViewDetail={setSelectedLog}
          onPageChange={fetchLogs}
        />
      </div>

      {/* Modal de Detalle Separado */}
      <AuditDetailModal 
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

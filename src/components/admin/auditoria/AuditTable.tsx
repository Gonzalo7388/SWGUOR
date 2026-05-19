'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, User, Database } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { AuditLog, PaginationData } from './types';

interface AuditTableProps {
  logs: AuditLog[];
  loading: boolean;
  pagination: { page: number; totalPages: number };
  onViewDetail: (log: AuditLog) => void;
  onPageChange: (page: number) => void;
}

export function AuditTable({
  logs,
  loading,
  pagination,
  onViewDetail,
  onPageChange
}: AuditTableProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREAR':      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">CREAR</Badge>;
      case 'ACTUALIZAR': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">ACTUALIZAR</Badge>;
      case 'ELIMINAR':   return <Badge className="bg-rose-100 text-rose-700 border-rose-200">ELIMINAR</Badge>;
      default:           return <Badge variant="outline" className="text-slate-500">{action}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[180px]">Fecha y Hora</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Módulo / Tabla</TableHead>
            <TableHead>ID Registro</TableHead>
            <TableHead className="text-right">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                Cargando registros...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                No se encontraron registros de auditoría.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">
                      {format(new Date(log.created_at), 'dd MMM, yyyy', { locale: es })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">
                        {log.usuarios?.personal_interno?.[0]?.nombre_completo ?? 'Sistema'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {log.usuarios?.email ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getActionBadge(log.accion)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
                      {log.tabla}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    #{log.registro_id}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-lg"
                    onClick={() => onViewDetail(log)}
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <span className="text-xs text-slate-400 font-medium">
          Página {pagination.page} de {pagination.totalPages}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="h-8 rounded-lg"
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="h-8 rounded-lg"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

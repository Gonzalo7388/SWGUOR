'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Calendar, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AuditLog } from './types';

interface AuditDetailModalProps {
  selectedLog: AuditLog | null;
  onClose: () => void;
}

export function AuditDetailModal({ selectedLog, onClose }: AuditDetailModalProps) {
  return (
    <Dialog open={!!selectedLog} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Detalle de Auditoría
          </DialogTitle>
          <DialogDescription>
            Comparativa de datos y metadatos del registro seleccionado
          </DialogDescription>
        </DialogHeader>

        {selectedLog && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de Acción
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  {format(new Date(selectedLog.created_at), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p className="text-[10px] text-slate-400">
                  Hora exacta: {format(new Date(selectedLog.created_at), 'HH:mm:ss')}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Metadatos
                </p>
                <p className="text-[10px] font-semibold text-slate-600">
                  IP: {selectedLog.ip_address ?? 'Desconocida'}
                </p>
                <p className="text-[10px] text-slate-400 truncate" title={selectedLog.user_agent ?? ''}>
                  Agente: {selectedLog.user_agent?.substring(0, 50)}...
                </p>
              </div>
            </div>

            {/* Antes / Después */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cambios Detectados</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                    <Clock className="w-3 h-3" /> Estado Anterior
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto min-h-[100px]">
                    <pre className="text-[10px] text-emerald-400 font-mono text-wrap">
                      {selectedLog.datos_antes 
                        ? JSON.stringify(selectedLog.datos_antes, null, 2)
                        : '// Sin datos previos'}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                    <ArrowRight className="w-3 h-3" /> Estado Posterior
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto min-h-[100px]">
                    <pre className="text-[10px] text-blue-400 font-mono text-wrap">
                      {selectedLog.datos_despues 
                        ? JSON.stringify(selectedLog.datos_despues, null, 2)
                        : '// Registro eliminado'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button className="rounded-xl bg-slate-900 text-white" onClick={onClose}>
                Cerrar Detalle
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

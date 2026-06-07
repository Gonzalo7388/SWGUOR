'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Calendar, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from './types';

interface AuditDetailModalProps {
  selectedLog: AuditLog | null;
  onClose: () => void;
}

export function AuditDetailModal({ selectedLog, onClose }: AuditDetailModalProps) {

  // Función para procesar y comparar las llaves de ambos objetos JSON
  const obtenerCambiosHumanos = () => {
    if (!selectedLog) return [];

    const antes = (selectedLog.datos_antes as Record<string, any>) || {};
    const despues = (selectedLog.datos_despues as Record<string, any>) || {};

    // Unir todas las llaves posibles omitiendo campos internos de BD
    const todasLasLlaves = Array.from(
      new Set([...Object.keys(antes), ...Object.keys(despues)])
    ).filter(key => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(key));

    return todasLasLlaves.map(llave => {
      const valorAntes = antes[llave];
      const valorDespues = despues[llave];

      // Formatear nombres de columnas comunes para que sean legibles
      const nombreLegible = llave
        .replace(/_id$/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Determinar el tipo de mutación individual por campo
      let tipo: 'creado' | 'modificado' | 'eliminado' | 'sin_cambios' = 'modificado';

      if (valorAntes === undefined || valorAntes === null) {
        tipo = 'creado';
      } else if (valorDespues === undefined || valorDespues === null) {
        tipo = 'eliminado';
      } else if (String(valorAntes) === String(valorDespues)) {
        tipo = 'sin_cambios';
      }

      return {
        campo: nombreLegible,
        originalKey: llave,
        antes: valorAntes !== null && valorAntes !== undefined ? String(valorAntes) : null,
        despues: valorDespues !== null && valorDespues !== undefined ? String(valorDespues) : null,
        tipo
      };
    }).filter(c => c.tipo !== 'sin_cambios'); // Ocultar lo que quedó igual
  };

  const listaCambios = obtenerCambiosHumanos();

  // Función auxiliar para pintar el Badge según tu Enum real en minúsculas
  const renderBadgeAccion = (accion: string) => {
    switch (accion) {
      case 'crear':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-emerald-50 text-emerald-700 border-emerald-200">Nuevo Registro</Badge>;
      case 'eliminar':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-rose-50 text-rose-700 border-rose-200">Eliminación</Badge>;
      case 'actualizar':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-amber-50 text-amber-700 border-amber-200">Actualización</Badge>;
      case 'aprobar':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-teal-50 text-teal-700 border-teal-200">Aprobado</Badge>;
      case 'rechazar':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-red-50 text-red-700 border-red-200">Rechazado</Badge>;
      case 'anular':
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-slate-100 text-slate-700 border-slate-300">Anulado</Badge>;
      default:
        return <Badge className="rounded-lg uppercase text-[10px] font-extrabold px-2.5 py-0.5 border shadow-none bg-blue-50 text-blue-700 border-blue-200">{accion}</Badge>;
    }
  };

  return (
    <Dialog open={!!selectedLog} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-slate-800 font-bold">
            <Activity className="w-5 h-5 text-indigo-600" />
            Detalle de la Operación
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Historial de cambios ejecutados en el sistema por el usuario responsable.
          </DialogDescription>
        </DialogHeader>

        {selectedLog && (
          <div className="space-y-6 pt-4">

            {/* Metadatos Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1 tracking-wider">
                  <Calendar className="w-3 h-3 text-slate-500" /> Cuándo Sucedió
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {format(new Date(selectedLog.created_at), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Hora exacta: {format(new Date(selectedLog.created_at), 'HH:mm:ss')} hrs.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1 tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-slate-500" /> Origen de la Solicitud
                </p>
                <p className="text-xs font-bold text-slate-700">
                  Dirección IP: <span className="font-mono text-slate-600 font-semibold">{selectedLog.ip_address ?? 'Desconocida'}</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5" title={selectedLog.user_agent ?? ''}>
                  Navegador: {selectedLog.user_agent ?? 'No especificado'}
                </p>
              </div>
            </div>

            {/* Panel de Cambios Limpio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Modificaciones Realizadas ({listaCambios.length})
                </h4>

                {/* Renderizado dinámico según tu tipo AccionAuditoria */}
                {renderBadgeAccion(selectedLog.accion)}
              </div>

              {listaCambios.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No se detectaron alteraciones en los campos principales</p>
                  <p className="text-[11px] text-slate-400/80 mt-0.5">El registro conservó sus propiedades originales durante esta transacción o es un evento sin mutación directa.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">

                  {/* Cabecera de Tabla Manual */}
                  <div className="grid grid-cols-3 bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <div>Dato / Propiedad</div>
                    <div>Valor Anterior</div>
                    <div>Valor Nuevo</div>
                  </div>

                  {/* Filas de Cambios */}
                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                    {listaCambios.map((cambio, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-3 px-4 py-3 text-xs items-center hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Celda Campo */}
                        <div className="font-bold text-slate-700 pr-2">
                          {cambio.campo}
                        </div>

                        {/* Celda Estado Anterior */}
                        <div className="pr-4">
                          {cambio.tipo === 'creado' ? (
                            <span className="text-[11px] text-slate-400 italic font-medium">— Vacío —</span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-rose-50 text-rose-700 rounded-lg font-medium border border-rose-100 break-all">
                              {cambio.antes}
                            </span>
                          )}
                        </div>

                        {/* Celda Estado Nuevo */}
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          {cambio.tipo === 'eliminado' ? (
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 rounded-lg font-medium border border-slate-200 line-through">
                              Borrado
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-100 break-all">
                              {cambio.despues}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 h-9 text-xs"
                onClick={onClose}
              >
                Entendido
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
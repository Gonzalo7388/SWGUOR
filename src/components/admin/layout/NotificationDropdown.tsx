"use client";

import React, { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Package, Clock, AlertTriangle, CheckCircle2, MailOpen, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// --- INTERFACES ---
interface NotificationItem {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'inventario' | 'orden' | 'urgente' | 'pago';
  importante: boolean;
  leido: boolean;
  fecha: string;
  url_destino?: string;
}

interface NotificationResponse {
  data: NotificationItem[];
  kpis: {
    sinLeer: number;
  };
}

// --- API CLIENT (Simulación) ---
const fetchNotifications = async (): Promise<NotificationResponse> => {
  const res = await fetch('/api/admin/notificaciones');
  if (!res.ok) throw new Error('Error al cargar');
  return res.json();
};

const markAsRead = async (id: string): Promise<void> => {
  const res = await fetch(`/api/admin/notificaciones/${id}`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Error al actualizar');
};

export function NotificationDropdown() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Gestión de estado con React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Polling cada 30 segundos para mayor sensación de tiempo real
  });

  const mutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Alerta marcada como leída");
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
  });

  const sinLeer = data?.kpis.sinLeer || 0;
  const notificaciones = data?.data || [];

  const getIcon = (tipo: string, leido: boolean) => {
    const iconClass = cn(
      "size-4",
      leido ? "text-slate-500" : "text-slate-900"
    );
    switch (tipo) {
      case 'inventario': return <Package className={iconClass} />;
      case 'produccion': return <Clock className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
          <Bell className="size-5 text-slate-600" />
          {sinLeer > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full size-4 bg-rose-600 text-[10px] font-bold text-white">
                {sinLeer > 99 ? '99+' : sinLeer}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-xl border-slate-100 rounded-2xl overflow-hidden z-[110]">
        
        {/* CABECERA FIJA */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Notificaciones</h4>
          {sinLeer > 0 && (
            <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={12}/>
              {sinLeer} {sinLeer === 1 ? 'Pendiente' : 'Pendientes'}
            </span>
          )}
        </div>

        {/* --- ÁREA SCROLLABLE --- */}
        <div className="max-h-[350px] overflow-y-auto bg-white custom-scrollbar">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm gap-2">
              <Loader2 className="animate-spin" size={18} /> Sincronizando...
            </div>
          ) : error ? (
            <div className="h-40 flex items-center justify-center text-rose-500 text-sm p-4 text-center">
              Error al cargar las notificaciones.
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-6">
              <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
              <p className="text-slate-900 text-sm font-semibold">¡Todo al día!</p>
              <p className="text-slate-500 text-xs mt-0.5">No hay nuevas alertas.</p>
            </div>
          ) : (
            notificaciones.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 transition-colors flex items-start gap-4 group relative cursor-pointer",
                  n.leido ? 'bg-white' : 'bg-rose-50/50',
                  'hover:bg-slate-50'
                )}
                onClick={() => {
                  if (n.url_destino) {
                    router.push(n.url_destino);
                  }
                  if (!n.leido) {
                    mutation.mutate(n.id);
                  }
                }}
              >
                {/* Icono Tipo */}
                <div className={cn(
                  "shrink-0 size-10 rounded-xl flex items-center justify-center border",
                  n.leido ? 'bg-slate-100 border-slate-200' : 'bg-white border-rose-100'
                )}>
                  {getIcon(n.tipo, n.leido)}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      n.leido ? 'text-slate-700' : 'text-slate-950'
                    )}>
                      {n.titulo}
                    </p>
                    {n.importante && !n.leido && (
                      <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-normal mt-0.5">
                    {n.descripcion}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                    {new Date(n.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })} • {new Date(n.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Acción Rápida (Hover) */}
                {!n.leido && (
                  <button 
                    onClick={() => mutation.mutate(n.id)}
                    className="absolute right-3 top-4 p-1.5 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                    title="Marcar como leída"
                  >
                    <MailOpen size={14} className="text-slate-600" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* FOOTER */}
        <div className="p-2 border-t border-slate-100 bg-white">
          <Button variant="ghost" className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium">
            Ver todas las notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
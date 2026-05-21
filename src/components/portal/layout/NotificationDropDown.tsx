'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Info, AlertTriangle, FileText, Truck, Layers } from 'lucide-react';
import Link from 'next/link';
import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Mapeo estricto a los tipos reales de tu base de datos
interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: 'pedido' | 'cotizacion' | 'despacho' | string; // public.TipoNotificacion
  titulo: string;
  mensaje: string;
  leido: boolean;
  leido_at: string | null;
  referencia_tipo: string | null;
  referencia_id: number | null;
  url_destino: string | null;
  created_at: string;
}

export function NotificationDropdown() {
  const { cliente } = usePortal(); // Asumiendo que dentro de cliente tienes el id del usuario asignado
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  
  const supabase = getSupabaseBrowserClient();
  const pendientes = notificaciones.filter(n => !n.leido).length;

  // El ID del usuario conectado que consume las alertas del portal
  const usuarioId = cliente?.usuario_id ?? cliente?.id; 

  // 1. Cargar el historial inicial desde PostgreSQL
  const fetchNotificaciones = useCallback(async () => {
    if (!usuarioId) return;

    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error al obtener notificaciones:', error.message);
    } else {
      setNotificaciones(data ?? []);
    }
  }, [usuarioId, supabase]);

  // 2. Suscripción en Tiempo Real vía Supabase Broadcast/Replication
  useEffect(() => {
    if (!usuarioId) return;

    fetchNotificaciones();

    const canal = supabase
      .channel(`notificaciones_user_${usuarioId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${usuarioId}`,
        },
        (payload) => {
          const nuevaAlerta = payload.new as Notificacion;
          setNotificaciones((prev) => [nuevaAlerta, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuarioId, fetchNotificaciones, supabase]);

  // 3. Mutación: Marcar como leído de forma optimista
  const marcarComoLeido = async (id: number) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true, leido_at: new Date().toISOString() } : n));

    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leido: true,
        leido_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar registro:', error.message);
      fetchNotificaciones(); // Reversión en caso de pérdida de conexión
    }
  };

  // 4. Mutación Masiva: Marcar todo como leído
  const marcarTodasComoLeidas = async () => {
    if (!usuarioId) return;

    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true, leido_at: new Date().toISOString() })));

    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leido: true,
        leido_at: new Date().toISOString()
      })
      .eq('usuario_id', usuarioId)
      .eq('leido', false);

    if (error) {
      console.error('Error en actualización masiva:', error.message);
      fetchNotificaciones();
    }
  };

  // Helper para renderizar dinámicamente los íconos del portal según tu enums
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'cotizacion':
        return <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-[#b5854b]"><FileText size={12} /></div>;
      case 'pedido':
        return <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Layers size={12} /></div>;
      case 'despacho':
        return <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><Truck size={12} /></div>;
      default:
        return <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500"><Info size={12} /></div>;
    }
  };

  return (
    <div className="relative">
      {/* Trigger de la campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 text-[#b5854b]/60 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-full transition-all focus:outline-none",
          isOpen && "bg-[#e4c28a]/20 text-[#b5854b]"
        )}
      >
        <Bell size={20} />
        {pendientes > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-600 text-white font-black text-[9px] flex items-center justify-center rounded-full border border-[#fff4e2] animate-pulse">
            {pendientes}
          </span>
        )}
      </button>

      {/* Contenedor del Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e4c28a]/30 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-3 bg-[#fff4e2]/60 border-b border-[#e4c28a]/20 flex items-center justify-between">
              <span className="text-[11px] font-black text-[#231e1d] uppercase tracking-wider">Notificaciones</span>
              {pendientes > 0 && (
                <button 
                  onClick={marcarTodasComoLeidas}
                  className="text-[9px] font-bold text-[#b5854b] hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  <Check size={10} /> Marcar todo leído
                </button>
              )}
            </div>

            {/* Listado de Alertas */}
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {notificaciones.length > 0 ? (
                notificaciones.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-3 flex gap-3 transition-colors text-left",
                      !n.leido ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50/60"
                    )}
                  >
                    {/* Icono izquierdo dinámico */}
                    <div className="shrink-0 mt-0.5">
                      {getIconoTipo(n.tipo)}
                    </div>

                    {/* Cuerpo de la Alerta con redirección opcional */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className={cn("text-xs text-slate-900 leading-snug break-words font-bold", !n.leido && "text-slate-900")}>
                        {n.titulo}
                      </p>
                      
                      {n.url_destino ? (
                        <Link 
                          href={n.url_destino}
                          onClick={() => {
                            if (!n.leido) marcarComoLeido(n.id);
                            setIsOpen(false);
                          }}
                          className="text-xs text-slate-600 block hover:underline hover:text-[#b5854b] break-words"
                        >
                          {n.mensaje}
                        </Link>
                      ) : (
                        <p className="text-xs text-slate-600 leading-snug break-words">
                          {n.mensaje}
                        </p>
                      )}

                      <p className="text-[9px] font-medium text-slate-400 uppercase pt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>

                    {/* Check de lectura manual */}
                    {!n.leido && (
                      <button 
                        onClick={() => marcarComoLeido(n.id)}
                        className="shrink-0 self-start p-1 text-slate-300 hover:text-[#b5854b] rounded-md hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                        title="Marcar como leída"
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1">
                  <Bell size={24} className="mx-auto text-slate-200" />
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Sin alertas nuevas</p>
                </div>
              )}
            </div>

            {/* Footer de Sincronización */}
            <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Historial Vinculado a PostgreSQL
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
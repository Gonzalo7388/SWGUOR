"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Package, Clock, AlertTriangle, CheckCircle2, Inbox, MailOpen, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// --- INTERFACES ---
interface NotificationItem {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'inventario' | 'produccion' | 'sistema';
  importante: boolean;
  leido: boolean;
  creado_en: string;
}

interface NotificationResponse {
  data: NotificationItem[];
  kpis: {
    sinLeer: number;
  };
}

export function NotificationDropdown() {
  const [notificaciones, setNotificaciones] = useState<NotificationItem[]>([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [cargando, setCargando] = useState(true);

  const cargarNotificaciones = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/admin/notificaciones');
      if (!res.ok) throw new Error('Error al cargar');
      const json: NotificationResponse = await res.json();
      setNotificaciones(json.data || []);
      setSinLeer(json.kpis.sinLeer || 0);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron cargar las alertas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    // Opcional: Polling cada 60 segundos
    const interval = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  const marcarComoLeido = async (id: string) => {
    try {
      await fetch(`/api/admin/notificaciones/${id}`, { method: 'PATCH' });
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
      setSinLeer(prev => Math.max(0, prev - 1));
      toast.success("Alerta marcada como leída");
    } catch (e) {
      toast.error("Error al actualizar estado");
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'inventario': return <Package size={16} className="text-amber-500" />;
      case 'produccion': return <Clock size={16} className="text-blue-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-all focus:outline-none group">
          <Bell size={20} className="text-slate-600 group-hover:text-rose-600 transition-colors" />
          {sinLeer > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-600 text-[9px] font-black text-white border-2 border-white">
                {sinLeer > 99 ? '99+' : sinLeer}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[400px] p-0 shadow-2xl border-slate-200 rounded-3xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABECERA FIJA */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Centro de Alertas</h4>
          {sinLeer > 0 && (
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={12}/>
              {sinLeer} {sinLeer === 1 ? 'PENDIENTE' : 'PENDIENTES'}
            </span>
          )}
        </div>

        {/* --- ÁREA SCROLLABLE --- */}
        <div 
          className="h-[320px] overflow-y-auto bg-white custom-scrollbar"
        >
          {cargando ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase animate-pulse gap-2">
              <Loader2 className="animate-spin" size={16} /> Sincronizando...
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <CheckCircle2 size={40} className="text-emerald-400 mb-4" />
              <p className="text-slate-900 text-sm font-black uppercase">¡Todo en orden!</p>
              <p className="text-slate-500 text-xs mt-1">No tienes alertas pendientes de revisión.</p>
            </div>
          ) : (
            notificaciones.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 transition-colors flex items-start gap-4 group relative ${
                  n.leido ? 'bg-white' : 'bg-rose-50/30'
                } hover:bg-slate-50`}
              >
                {/* Icono Tipo */}
                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  n.leido ? 'bg-slate-100 border-slate-200' : 'bg-white border-rose-100'
                }`}>
                  {getIcon(n.tipo)}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-black uppercase leading-tight ${n.leido ? 'text-slate-800' : 'text-slate-950'}`}>
                      {n.titulo}
                    </p>
                    {n.importante && !n.leido && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    {n.descripcion}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                    {new Date(n.creado_en).toLocaleString('es-PE', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                {/* Acción Rápida (Hover) */}
                {!n.leido && (
                  <button 
                    onClick={() => marcarComoLeido(n.id)}
                    className="absolute right-3 top-4 p-1.5 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                    title="Marcar como leída"
                  >
                    <MailOpen size={14} className="text-slate-500" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* FOOTER OPCIONAL */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Button variant="ghost" className="w-full text-xs font-bold text-slate-600 hover:text-rose-600">
            Ver historial completo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
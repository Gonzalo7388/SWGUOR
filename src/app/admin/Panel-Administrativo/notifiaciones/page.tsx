"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, Info, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notificacion {
  id: number;
  tipo: 'orden' | 'inventario' | 'pago' | 'mensaje' | 'sistema';
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  importante: boolean;
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mostrarNoLeidas, setMostrarNoLeidas] = useState(false);
  const [kpis, setKpis] = useState({ sinLeer: 0, importantes: 0, total: 0 });

  useEffect(() => {
    cargarDatos();
  }, [filtroTipo, mostrarNoLeidas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
      if (mostrarNoLeidas) params.append('soloNoLeidas', 'true');

      const response = await fetch(`/api/admin/notificaciones?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al cargar notificaciones');

      const { data, kpis: kpisData } = await response.json();
      
      // Mapear datos del API
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        tipo: item.tipo,
        titulo: item.titulo,
        descripcion: item.descripcion,
        fecha: new Date(item.fecha).toLocaleString('es-PE'),
        leida: item.leida,
        importante: item.importante
      }));

      setNotificaciones(datosFormateados);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const notificacionesFiltradas = notificaciones;

  const marcarComoLeida = async (id: number) => {
    try {
      const response = await fetch('/api/admin/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'marcarComoLeida', id })
      });

      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id === id ? {...n, leida: true} : n
        ));
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const marcarComoImportante = async (id: number) => {
    try {
      const response = await fetch('/api/admin/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'marcarComoImportante', id })
      });

      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id === id ? {...n, importante: !n.importante} : n
        ));
      }
    } catch (error) {
      console.error('Error marcando como importante:', error);
    }
  };

  const eliminar = async (id: number) => {
    try {
      const response = await fetch('/api/admin/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar', id })
      });

      if (response.ok) {
        setNotificaciones(notificaciones.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const getIconoTipo = (tipo: string) => {
    const iconos: any = {
      orden: <CheckCircle2 size={18} />,
      inventario: <AlertTriangle size={18} />,
      pago: <CheckCircle2 size={18} />,
      mensaje: <MessageSquare size={18} />,
      sistema: <Info size={18} />
    };
    return iconos[tipo];
  };

  const getColoresTipo = (tipo: string) => {
    const colores: any = {
      orden: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
      inventario: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
      pago: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
      mensaje: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
      sistema: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600' }
    };
    return colores[tipo];
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Centro de Notificaciones</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {kpis.sinLeer} notificaciones sin leer
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
          <Bell size={20} className="text-slate-600" />
          <span className="font-bold text-slate-900">{kpis.sinLeer}</span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-3 flex-wrap">
        {['todos', 'orden', 'inventario', 'pago', 'mensaje', 'sistema'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
              filtroTipo === tipo
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tipo === 'todos' ? 'Todas' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={mostrarNoLeidas}
            onChange={(e) => setMostrarNoLeidas(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-xs font-bold text-slate-600 uppercase">Solo sin leer</label>
        </div>
      </div>

      {/* NOTIFICACIONES */}
      <div className="space-y-3">
        {notificacionesFiltradas.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center">
            <Bell size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold text-sm uppercase">No hay notificaciones</p>
          </div>
        ) : (
          notificacionesFiltradas.map(notif => {
            const colores = getColoresTipo(notif.tipo);
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  notif.leida 
                    ? 'bg-white border-slate-100' 
                    : `${colores.bg} border-2 ${colores.border}`
                }`}
                onClick={() => marcarComoLeida(notif.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`${colores.icon} mt-1`}>
                    {getIconoTipo(notif.tipo)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 uppercase text-sm">{notif.titulo}</h4>
                    <p className="text-slate-600 text-sm mt-1">{notif.descripcion}</p>
                    <span className="text-xs text-slate-500 font-bold mt-2 block">{notif.fecha}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        marcarComoImportante(notif.id);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        notif.importante
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminar(notif.id);
                      }}
                      className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIGURACIÓN DE NOTIFICACIONES */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <h3 className="font-black uppercase text-slate-800 mb-6">Configurar Notificaciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Órdenes completadas', checked: true },
            { label: 'Stock bajo', checked: true },
            { label: 'Nuevos pagos', checked: true },
            { label: 'Mensajes de clientes', checked: true },
            { label: 'Backups completados', checked: false },
            { label: 'Actualizaciones del sistema', checked: false }
          ].map(config => (
            <label key={config.label} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50">
              <input type="checkbox" defaultChecked={config.checked} className="w-5 h-5" />
              <span className="font-bold text-slate-700">{config.label}</span>
            </label>
          ))}
        </div>

        <Button className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase">
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
}

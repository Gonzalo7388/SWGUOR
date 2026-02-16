"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Package, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; 

export function NotificationDropdown() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ sinLeer: 0 });
  const [cargando, setCargando] = useState(true);

  const cargarNotificaciones = async () => {
    try {
      const res = await fetch('/api/admin/notificaciones');
      const { data, kpis: kpisData } = await res.json();
      setNotificaciones(data || []);
      setKpis(kpisData || { sinLeer: 0 });
    } catch (e) { console.error(e); } finally { setCargando(false); }
  };

  useEffect(() => { cargarNotificaciones(); }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-all focus:outline-none group">
          <Bell size={20} className="text-slate-600 group-hover:text-rose-600 transition-colors" />
          {kpis.sinLeer > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-600 text-[9px] font-black text-white border-2 border-white">
                {kpis.sinLeer > 99 ? '99+' : kpis.sinLeer}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABECERA FIJA */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Centro de Avisos</h4>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
            {kpis.sinLeer} ALERTAS
          </span>
        </div>

        {/* --- EL ÁREA DE DIMENSIÓN PEQUEÑA (SCROLL) --- */}
        <div 
          className="h-[280px] overflow-y-scroll bg-white divide-y divide-slate-50 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#f43f5e #f1f5f9' 
          }}
        >
          {cargando ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase animate-pulse">
              Sincronizando...
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">Sin pendientes</p>
            </div>
          ) : (
            notificaciones.map((n) => (
              <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 group relative">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-all">
                  {n.tipo === 'inventario' ? <Package size={15} className="text-amber-500" /> : <Clock size={15} className="text-blue-500" />}
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[10px] font-black text-slate-900 uppercase leading-tight mb-0.5">
                    {n.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    {n.descripcion}
                  </p>
                </div>

                {n.importante && (
                  <span className="absolute right-3 top-4 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
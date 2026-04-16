import React from 'react';
import { ESTADOS_CONFECCION } from '@/lib/constants/estados';
import { useTalleres } from '@/lib/hooks/useTalleres';

interface FiltrosProps {
  filtroEstado: string;
  setFiltroEstado: (val: string) => void;
  filtroTaller: string;
  setFiltroTaller: (val: string) => void;
}

export const ConfeccionesFiltros = ({ filtroEstado, setFiltroEstado, filtroTaller, setFiltroTaller }: FiltrosProps) => {
  const { talleres } = useTalleres();
  
  return (
    <div className="flex gap-3">
      <select 
        value={filtroEstado} 
        onChange={(e) => setFiltroEstado(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase bg-white cursor-pointer hover:border-slate-400 transition-colors"
      >
        <option value="todos">Todos los Estados</option>
        {Object.entries(ESTADOS_CONFECCION).map(([key, info]) => (
          <option key={key} value={key}>{info.label}</option>
        ))}
      </select>

      <select 
        value={filtroTaller} 
        onChange={(e) => setFiltroTaller(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase bg-white cursor-pointer hover:border-slate-400 transition-colors"
      >
        <option value="todos">Todos los Talleres</option>
        {talleres.map(t => (
          <option key={t.id} value={t.nombre}>{t.nombre}</option>
        ))}
      </select>
    </div>
  );
};
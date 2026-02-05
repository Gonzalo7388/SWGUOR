import { memo } from 'react';
import { ESTADOS_CONFECCION } from '@/lib/constants/estados';

interface Confeccion {
  id: number;
  pedido_id: number;
  cliente: string;
  prenda: string;
  cantidad: number;
  taller: string;
  estado: string;
  fecha_entrega: string;
  progreso: number;
}

const ConfeccionRow = memo(({ conf }: { conf: Confeccion }) => {
  const infoEstado = ESTADOS_CONFECCION[conf.estado as keyof typeof ESTADOS_CONFECCION] 
                    || ESTADOS_CONFECCION.corte;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="py-5 px-4 font-black text-slate-900">#{conf.pedido_id}</td>
      <td className="py-5 px-4 text-slate-600 font-medium">{conf.cliente}</td>
      <td className="py-5 px-4 text-slate-600 font-bold">{conf.prenda}</td>
      <td className="py-5 px-4 text-center">
        <span className="bg-slate-100 px-2 py-1 rounded text-slate-900 font-black text-xs">{conf.cantidad}</span>
      </td>
      <td className="py-5 px-4 text-slate-600">{conf.taller}</td>
      <td className="py-5 px-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${infoEstado.bgColor} ${infoEstado.color}`}>
          {infoEstado.label}
        </span>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-slate-900 h-full transition-all duration-500" 
              style={{ width: `${conf.progreso}%` }} 
            />
          </div>
          <span className="text-[10px] font-black text-slate-900">{conf.progreso}%</span>
        </div>
      </td>
      <td className="py-5 px-4 text-slate-500 font-bold text-xs">{conf.fecha_entrega}</td>
    </tr>
  );
});

ConfeccionRow.displayName = "ConfeccionRow";

export const ConfeccionesTable = ({ data, loading }: { data: Confeccion[], loading: boolean }) => {
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs animate-pulse">
        Actualizando lista de producción...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-100">
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prenda</th>
            <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant.</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Taller</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</th>
            <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrega</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map(conf => (
            <ConfeccionRow key={conf.id} conf={conf} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
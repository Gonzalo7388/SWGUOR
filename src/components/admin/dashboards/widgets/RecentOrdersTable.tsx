"use client";

import React from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Orden, EstadoOrden } from '@/types/database';

interface RecentOrdersTableProps {
  orders: (Orden & { clientes: { razon_social: string } | null })[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  
  // Función para obtener estilo e ICONO según el estado
  const getStatusDetails = (status: EstadoOrden) => {
    const configs: Record<string, { class: string; icon: React.ReactNode }> = {
      solicitado: { 
        class: "bg-blue-50 text-blue-600 border-blue-100", 
        icon: <Clock size={12} className="mr-1" /> 
      },
      cotizado: { 
        class: "bg-purple-50 text-purple-600 border-purple-100", 
        icon: <Clock size={12} className="mr-1" /> 
      },
      aprobado: { 
        class: "bg-emerald-50 text-emerald-600 border-emerald-100", 
        icon: <CheckCircle2 size={12} className="mr-1" /> 
      },
      pagado: { 
        class: "bg-cyan-50 text-cyan-600 border-cyan-100", 
        icon: <CheckCircle2 size={12} className="mr-1" /> 
      },
      en_proceso: { 
        class: "bg-orange-50 text-orange-600 border-orange-100", 
        icon: <AlertCircle size={12} className="mr-1" /> 
      },
      finalizado: { 
        class: "bg-slate-100 text-slate-600 border-slate-200", 
        icon: <CheckCircle2 size={12} className="mr-1" /> 
      },
      cancelado: { 
        class: "bg-rose-50 text-rose-600 border-rose-100", 
        icon: <AlertCircle size={12} className="mr-1" /> 
      },
    };
    return configs[status] || { class: "bg-gray-50 text-gray-600", icon: null };
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-black uppercase tracking-tighter text-slate-800 text-xl flex items-center gap-2">
            <Clock className="text-rose-500" size={20} /> {/* Uso de Clock en el título */}
            Órdenes Recientes
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitor de flujo operativo</p>
        </div>
        <button className="text-[10px] font-black uppercase bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
              <th className="pb-4 pl-4">ID</th>
              <th className="pb-4">Cliente</th>
              <th className="pb-4">Monto</th>
              <th className="pb-4">Estado</th>
              <th className="pb-4 text-right pr-4">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const { class: statusClass, icon: statusIcon } = getStatusDetails(order.estado);
              return (
                <tr key={order.id} className="group hover:bg-slate-50 transition-all">
                  <td className="py-4 pl-4 bg-slate-50 group-hover:bg-white rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200">
                    <span className="font-black text-slate-900 text-xs italic">#{order.id.toString().slice(0, 5)}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm truncate max-w-50">
                        {order.clientes?.razon_social || 'Consumidor Final'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-black text-slate-900 text-sm">S/ {order.total?.toLocaleString()}</span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${statusClass}`}>
                      {statusIcon}
                      {order.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 bg-slate-50 group-hover:bg-white">
                    {/* Uso de Eye para la acción de ver */}
                    <button className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer del widget con una alerta visual si hay muchas órdenes pendientes */}
      <div className="mt-6 flex items-center gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <AlertCircle size={14} className="text-blue-600" />
        <p className="text-[10px] font-bold text-blue-600 uppercase">
          Tienes {orders.filter(o => o.estado === 'solicitado').length} órdenes nuevas por cotizar hoy.
        </p>
      </div>
    </div>
  );
}
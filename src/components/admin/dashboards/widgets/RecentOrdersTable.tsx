"use client";

import React from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Orden, EstadoOrden } from '@/types';

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
      <div className="mb-8 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black uppercase tracking-tight text-slate-800 text-lg leading-none">Órdenes Recientes</h3>
            <p className="text-slate-400 text-sm font-medium mt-2">Monitor en tiempo real del flujo operativo</p>
          </div>
          <button className="text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-sm">
            Ver todas
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <th className="pb-4 pl-4">Orden ID</th>
              <th className="pb-4">Cliente</th>
              <th className="pb-4">Monto Total</th>
              <th className="pb-4">Estado</th>
              <th className="pb-4 text-right pr-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const { class: statusClass, icon: statusIcon } = getStatusDetails(order.estado || 'solicitado');
              return (
                <tr key={order.id} className="group hover:shadow-md transition-all">
                  <td className="py-4 pl-4 bg-slate-50 group-hover:bg-white rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200 transition-all">
                    <span className="font-black text-slate-900 text-[11px] italic">#{order.id.toString().padStart(5, '0')}</span>
                  </td>
                  <td className="py-4 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-[12px] uppercase leading-tight max-w-xs truncate">
                        {order.clientes?.razon_social || 'Consumidor General'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {new Date(order.created_at).toLocaleDateString('es-PE', {weekday: 'short', day: 'numeric', month: 'short'})}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <span className="font-black text-slate-900 text-[13px]">S/ {order.total?.toLocaleString()}</span>
                  </td>
                  <td className="py-4 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border gap-1.5 ${statusClass}`}>
                      {statusIcon}
                      {(order.estado || 'solicitado').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 pr-4 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 bg-slate-50 group-hover:bg-white transition-all text-right">
                    <button className="p-2.5 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all inline-flex">
                      <Eye size={16} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer - Quick Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
        <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-wider">
            {orders.filter(o => o.estado === 'solicitado').length} Órdenes Pendientes
          </p>
          <p className="text-[8px] text-blue-600 font-bold uppercase mt-1">Requieren cotización o aprobación</p>
        </div>
      </div>
    </div>
  );
}
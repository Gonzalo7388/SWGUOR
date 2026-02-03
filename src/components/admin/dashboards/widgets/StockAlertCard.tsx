"use client";

import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Inventario } from '@/types/database';

interface StockAlertCardProps {
  items: Inventario[];
}

export default function StockAlertCard({ items }: StockAlertCardProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-orange-100 h-full flex flex-col">
      {/* HEADER DEL WIDGET */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Uso de AlertTriangle para indicar criticidad */}
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter text-slate-800 leading-tight">Stock Crítico</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insumos GUOR</p>
          </div>
        </div>
        <span className="bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
          {items.length} ALERTAS
        </span>
      </div>

      {/* CUERPO - LISTADO CON SCROLL (h-72 para evitar el error de h-75) */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar grow">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-orange-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                {/* Uso de Package para identificar el producto */}
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-orange-50 transition-colors">
                  <Package size={18} className="text-slate-400 group-hover:text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700 uppercase leading-none mb-1">{item.nombre}</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                    <span className="w-1 h-1 bg-rose-500 rounded-full inline-block"></span>
                    Quedan {item.stock_actual} {item.unidad_medida}
                  </p>
                </div>
              </div>
              
              {/* Uso de ArrowRight para indicar navegación a la gestión */}
              <button className="p-2 bg-white text-orange-600 rounded-lg shadow-sm hover:bg-orange-600 hover:text-white transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Package size={48} className="mb-2 text-slate-300" />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-tighter italic">Almacén abastecido</p>
          </div>
        )}
      </div>

      {/* FOOTER - ACCIÓN GLOBAL */}
      <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
        Reponer Inventario
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
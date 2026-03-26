'use client';

import { ShoppingBag, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';

const ORDENES = [
  { id: 'ORD-5502', fecha: '2024-10-20', total: 15400.00, estado: 'en_produccion', pago: 'Pendiente' },
  { id: 'ORD-5488', fecha: '2024-10-05', total: 8200.00, estado: 'completada', pago: 'Pagado' },
];

export default function MisOrdenesPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mis Órdenes</h1>
          <p className="text-sm text-slate-500">Historial de compras y estado de producción.</p>
        </div>
      </div>

      <div className="space-y-4">
        {ORDENES.map((orden) => (
          <div key={orden.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="text-center px-4 py-2 border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Orden</p>
                <p className="font-black text-slate-900">{orden.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Monto Total</p>
                <p className="text-lg font-black text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">
                  S/ {orden.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Producción</p>
                <EstadoBadge estado={orden.estado} tipo="orden" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pago</p>
                <div className="flex items-center gap-1.5">
                   <div className={`w-2 h-2 rounded-full ${orden.pago === 'Pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                   <span className="text-xs font-bold text-slate-700">{orden.pago}</span>
                </div>
              </div>
              <button className="col-span-2 md:col-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
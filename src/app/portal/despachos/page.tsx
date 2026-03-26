'use client';

import { SeguimientoTimeline } from '@/components/portal/SeguimientoTimeline';
import { Package, MapPin, Calendar } from 'lucide-react';

// Datos de prueba (Luego vendrán de Supabase)
const DESPACHOS_ACTIVOS = [
  {
    id: 'DES-8821',
    orden: 'ORD-5502',
    estado: 'en_ruta',
    destino: 'Almacén Central - Av. La Marina 1420',
    fecha_est: '28 de Oct, 2024',
    items: 450
  }
];

export default function DespachosPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Seguimiento de Despachos</h1>
        <p className="text-sm text-slate-500">Monitorea el estado de tus pedidos en tiempo real.</p>
      </div>

      {DESPACHOS_ACTIVOS.map((despacho) => (
        <div key={despacho.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Header de la Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={24} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">{despacho.id}</h2>
                <p className="text-xs text-slate-500">Vinculado a: <span className="font-bold text-blue-600">{despacho.orden}</span></p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-right">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <Calendar size={12} /> Entrega Estimada
                </div>
                <p className="text-sm font-bold text-slate-900">{despacho.fecha_est}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <MapPin size={12} /> Destino
                </div>
                <p className="text-sm font-bold text-slate-900">{despacho.destino}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <SeguimientoTimeline estadoActual={despacho.estado} />

          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
            <p className="text-xs text-slate-500 italic">
              * Los horarios pueden variar según condiciones logísticas en Lima Metropolitana.
            </p>
            <button className="text-blue-600 font-bold text-xs hover:underline">
              Ver Guía de Remisión
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
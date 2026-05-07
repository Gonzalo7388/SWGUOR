'use client';

import { SeguimientoTimeline } from '@/components/portal/SeguimientoTimeline';
import { Package, MapPin, Calendar, Link, AlertCircle } from 'lucide-react';

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
  // Lógica para el CUS_21
const handleConfirmarEntrega = async (despachoId: string) => {
  const confirmacion = window.confirm(`¿Confirmas que has recibido el despacho ${despachoId} correctamente?`);
  if (confirmacion) {
    alert("¡Estado actualizado!");
  }
};
  const confirmarEntrega = async (despachoId: string) => {
  const confirmacion = confirm(`¿Confirmas que has recibido el despacho ${despachoId} correctamente?`);
  
  if (confirmacion) {
    // Aquí simulamos la actualización en la base de datos
    console.log("Actualizando despacho a ENTREGADO...", despachoId);
    alert("¡Gracias! El estado del despacho ha sido actualizado a 'Entregado'.");
    // En el futuro, aquí harías un .from('despachos').update({ estado: 'entregado' })
  }
};
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
            <div className="flex gap-4">
  {/* NUEVO BOTÓN PARA TU CUS_25 */}
  <Link 
    href="/portal/despachos/incidencias"
    className="text-red-500 font-bold text-xs hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1"
  >
    <AlertCircle size={14} />
    Reportar Incidencia
  </Link>
 {/* NUEVO BOTÓN CUS_21: Confirmar Entrega */}
  {despacho.estado !== 'entregado' && (
    <button 
      onClick={() => confirmarEntrega(despacho.id)}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95"
    >
      Confirmar Entrega
    </button>
  )}
  <button className="text-blue-600 font-bold text-xs hover:underline">
    Ver Guía de Remisión
  </button>
</div>
          </div>
        </div>
      ))}
    </div>
  );

}

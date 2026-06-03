'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, CheckCircle2,
  Sparkles, Package, AlertCircle, Loader2
} from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { toast } from 'sonner';
import { exportCotizacionIndividualToPDF, buildCotizacionPDFData } from '@/lib/utils/export-utils';

export default function DetalleCotizacionPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [cot, setCot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!id) return;

    const fetchDetalle = async () => {
      try {
        const res = await fetch(`/api/portal/cotizaciones/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el detalle');
        const { data } = await res.json();
        setCot(data);
      } catch (e) {
        console.error(e);
        toast.error("No se pudo cargar la cotización");
        router.push('/portal/cotizaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id, router]);

  // Protección esencial contra errores de hidratación
  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Obteniendo detalles...</p>
      </div>
    );
  }

  if (!cot) return null;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button
          onClick={() => router.push('/portal/cotizaciones')}
          className="flex items-center gap-2 text-slate-500 hover:text-black transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver al historial
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
                setDescargando(true);
                // ... (mantiene tu lógica de PDF actual)
                setDescargando(false);
            }}
            disabled={descargando}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            {descargando ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <h1 className="text-4xl font-black text-slate-900">{cot.numero}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Generado el {formatDateLong(cot.created_at)}</p>
            
            <table className="w-full text-sm mt-8">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 text-left">Detalle del Producto</th>
                  <th className="pb-4 text-center">Cant.</th>
                  <th className="pb-4 text-right">Unitario</th>
                  <th className="pb-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cot.cotizacion_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50 overflow-hidden">
                          {item.productos?.imagen ? (
                            <img src={item.productos.imagen} className="w-full h-full object-cover" alt={item.productos.nombre} />
                          ) : (
                            <Package size={24} className="opacity-40" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base">{item.productos?.nombre ?? 'Producto'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.productos?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-center font-black text-slate-700">{item.cantidad}</td>
                    <td className="py-6 text-right font-medium text-slate-600">{formatCurrency(item.precio_unitario_snapshot)}</td>
                    <td className="py-6 text-right font-black text-slate-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Aquí iría el resto de tu columna derecha con el Resumen Financiero */}
      </div>
    </div>
  );
}
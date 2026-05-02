'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Download, CheckCircle2, 
  Clock, Sparkles, Package, AlertCircle, Loader2 
} from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { toast } from 'sonner';

// Colores de marca
const BRAND_COLORS = {
  naranjaClaro: '#fff4e2',
  naranjaPastel: '#fbddd3',
  naranjaApagado: '#e4c28a',
  ocre: '#b5854b',
  negroFondo: '#231e1d'
};

// Interfaces para evitar el uso de 'any'
interface ProductoInfo {
  nombre: string;
  sku: string;
  imagen_url: string | null;
}

interface CotizacionItem {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: ProductoInfo | null;
}

interface CotizacionDetalle {
  id: number;
  numero: string;
  estado: string;
  created_at: string;
  analisis_ia: string | null;
  subtotal_bruto: number;
  descuento: number;
  porcentaje_descuento: number;
  igv: number;
  total: number;
  items: CotizacionItem[];
}

export default function DetalleCotizacionPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [cot, setCot] = useState<CotizacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetalle = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('cotizaciones')
          .select(`
            *,
            items:cotizacion_items(
              id, cantidad, precio_unitario, subtotal,
              producto:productos(nombre, sku, imagen_url)
            )
          `)
          .eq('id', Number(id))
          .single();

        if (error) throw error;
        setCot(data as unknown as CotizacionDetalle);
      } catch (error) {
        toast.error("No se pudo cargar la cotización");
        router.push('/portal/cotizaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin" size={40} style={{ color: BRAND_COLORS.ocre }} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Obteniendo detalles...</p>
      </div>
    );
  }

  if (!cot) return null;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => router.push('/portal/cotizaciones')}
          className="flex items-center gap-2 text-slate-500 hover:text-black transition-all text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Volver al historial
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-700">
            <Download size={18} /> Exportar PDF
          </button>
          {(cot.estado === 'borrador' || cot.estado === 'enviada') && (
            <button 
              className="text-white px-8 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: BRAND_COLORS.ocre }}
            >
              Aprobar y Confirmar Pedido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Listado de Productos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
              <div>
                <p className="text-[10px] font-black text-ocre uppercase tracking-[0.2em] mb-1" style={{ color: BRAND_COLORS.ocre }}>Documento Oficial</p>
                <h1 className="text-4xl font-black text-slate-900" style={{ color: BRAND_COLORS.negroFondo }}>{cot.numero}</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Generado el {formatDateLong(cot.created_at)}</p>
              </div>
              <EstadoBadge estado={cot.estado} tipo="cotizacion" className="scale-125 origin-top-right" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 text-left">Detalle del Producto</th>
                    <th className="pb-4 text-center">Cant.</th>
                    <th className="pb-4 text-right">Unitario</th>
                    <th className="pb-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cot.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm"
                            style={{ backgroundColor: BRAND_COLORS.naranjaClaro }}
                          >
                            <Package style={{ color: BRAND_COLORS.ocre }} size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base">{item.producto?.nombre}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">SKU: {item.producto?.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-center font-black text-slate-700 text-base">{item.cantidad}</td>
                      <td className="py-6 text-right font-medium text-slate-600">{formatCurrency(item.precio_unitario)}</td>
                      <td className="py-6 text-right font-black text-slate-900 text-base">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen e IA */}
        <div className="space-y-6">
          {/* Card de IA con degradado de marca */}
          <div 
            className="rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.negroFondo} 0%, #3e3634 100%)` }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles size={20} className="text-orange-300" />
              </div>
              <h3 className="font-black text-xs uppercase tracking-widest">Análisis Estratégico</h3>
            </div>
            <p className="text-sm text-orange-50/90 leading-relaxed italic font-medium">
              "{cot.analisis_ia || "Su volumen actual le permite acceder a la tarifa preferencial Nivel 2. Recomendamos aumentar 50 unidades para alcanzar el Nivel 3 de descuento."}"
            </p>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-orange-200/50">
              <span>Smart Insight</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Optimizado</span>
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest border-b border-slate-50 pb-4">Desglose Comercial</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Subtotal Neto</span>
                <span className="font-bold text-slate-700">{formatCurrency(cot.subtotal_bruto)}</span>
              </div>

              {cot.descuento > 0 && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-black text-emerald-700 uppercase">Ahorro ({cot.porcentaje_descuento}%)</span>
                  <span className="font-black text-emerald-700">-{formatCurrency(cot.descuento)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Impuestos (18%)</span>
                <span className="font-bold text-slate-700">{formatCurrency(cot.igv)}</span>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Final</span>
                  <span className="text-3xl font-black text-slate-900 leading-none" style={{ color: BRAND_COLORS.negroFondo }}>
                    {formatCurrency(cot.total)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Aviso de MOQ */}
            <div 
              className="rounded-2xl p-4 flex gap-3 items-start border"
              style={{ backgroundColor: BRAND_COLORS.naranjaClaro, borderColor: BRAND_COLORS.naranjaPastel }}
            >
              <AlertCircle size={20} style={{ color: BRAND_COLORS.ocre }} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: BRAND_COLORS.ocre }}>Condiciones de Venta</p>
                <p className="text-[11px] font-medium text-slate-600 leading-snug">
                  Cotización sujeta a MOQ de 400 unidades. Validez de precios por 7 días calendario tras la emisión.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
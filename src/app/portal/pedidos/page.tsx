'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, ArrowRight, Calendar, CircleDollarSign } from 'lucide-react';
import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import Link from 'next/link';
import type { EstadoPago } from '@prisma/client';

// Colores de marca extraídos del archivo proporcionado 
const BRAND_COLORS = {
  naranjaClaro: '#fff4e2',
  naranjaPastel: '#fbddd3',
  naranjaApagado: '#e4c28a',
  ocre: '#b5854b',
  negroFondo: '#231e1d'
};

interface Pedido {
  id: number;
  codigo_referencia: string;
  fecha_pedido: string;
  total: number;
  estado: string;
  estado_pago: EstadoPago;
  created_at: string;
}

// Interfaz para la respuesta de Supabase que resuelve los errores de propiedades inexistentes
interface RawPedidoDB {
  id: number;
  cliente_id: number | null;
  estado: "pendiente" | "cancelado" | "entregado" | "en_produccion" | "listo_para_despacho" | null;
  estado_pago: EstadoPago | null;
  created_at: string | null;
  updated_at: string | null;
  total?: number | null; 
  monto_total?: number | null;
  codigo_referencia?: string | null;
  fecha_pedido?: string | null;
}

export default function MisPedidosPage() {
  const { cliente, loading: authLoading } = usePortal();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPedidos() {
      if (!cliente?.id) return;

      const supabase = getSupabaseBrowserClient();
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false }) as { data: RawPedidoDB[] | null, error: any };

      if (!error && data) {
        const dataFormateada: Pedido[] = data.map((p) => ({
          id: p.id,
          codigo_referencia: p.codigo_referencia ?? `PED-${p.id}`,
          fecha_pedido: p.fecha_pedido ?? p.created_at ?? new Date().toISOString(),
          total: p.total ?? p.monto_total ?? 0,
          estado: p.estado ?? 'pendiente',
          estado_pago: p.estado_pago ?? 'pendiente',
          created_at: p.created_at ?? new Date().toISOString(),
        }));
        setPedidos(dataFormateada);
      }
      setLoading(false);
    }

    if (!authLoading) fetchPedidos();
  }, [cliente, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
        <Loader2 size={30} className="animate-spin" style={{ color: BRAND_COLORS.ocre }} />
        <span className="text-sm font-medium text-slate-500">Cargando tus pedidos...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header con colores de marca */}
      <div className="flex items-center gap-4">
        <div 
          className="p-4 text-white rounded-2xl shadow-xl"
          style={{ backgroundColor: BRAND_COLORS.ocre }}
        >
          <ShoppingBag size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black" style={{ color: BRAND_COLORS.negroFondo }}>
            Mis Pedidos
          </h1>
          <p className="text-slate-500 font-medium">Seguimiento de tus compras y producción.</p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div 
          className="border-2 border-dashed rounded-3xl p-16 text-center"
          style={{ borderColor: BRAND_COLORS.naranjaApagado, backgroundColor: BRAND_COLORS.naranjaClaro }}
        >
          <p className="font-bold text-slate-600">Aún no tienes pedidos registrados.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pedidos.map((pedido) => (
            <div 
              key={pedido.id} 
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all group"
            >
              {/* Info Izquierda */}
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="text-center px-4 border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número</p>
                  <p className="text-xl font-black" style={{ color: BRAND_COLORS.negroFondo }}>
                    #{pedido.id}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <Calendar size={12} style={{ color: BRAND_COLORS.ocre }} />
                    <span>Fecha</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(pedido.fecha_pedido).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <CircleDollarSign size={12} style={{ color: BRAND_COLORS.ocre }} />
                    <span>Total</span>
                  </div>
                  <p className="text-xl font-black" style={{ color: BRAND_COLORS.negroFondo }}>
                    S/ {pedido.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Status y Botón Derecha */}
              <div className="flex items-center gap-10 w-full md:w-auto justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Avance</p>
                  <EstadoBadge estado={pedido.estado} tipo="orden" />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pago</p>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      pedido.estado_pago === 'verificado' ? 'bg-emerald-500' : 
                      pedido.estado_pago === 'pendiente' ? 'bg-blue-500' : 'bg-amber-500'
                    )} />
                    <span className="text-xs font-bold text-slate-700 capitalize">
                      {pedido.estado_pago.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <Link 
                  href={`/portal/pedidos/${pedido.id}`}
                  className="p-4 rounded-xl transition-all group-hover:scale-105"
                  style={{ backgroundColor: BRAND_COLORS.naranjaClaro, color: BRAND_COLORS.ocre }}
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
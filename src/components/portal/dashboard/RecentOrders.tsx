'use client';

import Link from 'next/link';
import { Package, ChevronRight, Circle } from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import type { EstadoPedido } from '@prisma/client';

interface Pedido {
  id: number;
  estado: EstadoPedido;
  total: number;
  created_at: string;
  total_unidades: number;
}

interface RecentOrdersProps {
  pedidos: Pedido[];
}

export function RecentOrders({ pedidos }: RecentOrdersProps) {
  return (
    <div className="bg-white border border-guor-line rounded-2xl p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-guor-ink tracking-tight">Mis Pedidos</h2>
          <p className="text-[10px] font-bold text-guor-soft uppercase tracking-wider mt-0.5">Últimas actividades</p>
        </div>
        <Link href="/portal/pedidos" className="w-7 h-7 rounded-full bg-guor-50 flex items-center justify-center text-guor-soft hover:bg-guor-600 hover:text-white transition-all">
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {pedidos.length > 0 ? (
          pedidos.map((p) => (
            <Link 
              key={p.id} 
              href={`/portal/pedidos/${p.id}`} 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-guor-50/60 transition-colors border border-transparent hover:border-guor-line group"
            >
              <div className="w-9 h-9 bg-guor-50 rounded-lg flex items-center justify-center text-guor-soft group-hover:bg-white group-hover:text-guor-600 transition-all shrink-0">
                <Package size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-guor-ink truncate">Orden #{p.id}</p>
                <p className="text-[10px] font-semibold text-guor-soft uppercase tracking-wide mt-0.5">{p.total_unidades} Unidades</p>
              </div>
              <div className="shrink-0">
                <EstadoBadge estado={p.estado} tipo="pedido" />
              </div>
            </Link>
          ))
        ) : (
          <div className="py-8 text-center space-y-1">
            <Package size={28} className="mx-auto text-guor-200" />
            <p className="text-guor-soft font-bold uppercase text-[9px] tracking-wider">Sin actividad</p>
          </div>
        )}
      </div>

      <div className="pt-5 border-t border-guor-line">
        <p className="text-[10px] font-bold text-guor-soft uppercase tracking-wider mb-3">Ayuda rápida</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/portal/perfil" className="flex items-center gap-2 p-2.5 rounded-xl bg-guor-50 text-[10px] font-bold uppercase text-guor-ink hover:bg-guor-100 transition-colors">
            <Circle size={6} className="fill-guor-500 text-guor-500" /> Perfil
          </Link>
          <Link href="/portal/seguimiento-pedido" className="flex items-center gap-2 p-2.5 rounded-xl bg-guor-50 text-[10px] font-bold uppercase text-guor-ink hover:bg-guor-100 transition-colors">
            <Circle size={6} className="fill-guor-500 text-guor-500" /> Tracking
          </Link>
        </div>
      </div>
    </div>
  );
}
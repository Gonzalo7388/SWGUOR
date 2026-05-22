'use client';

import Link from 'next/link';
import { FileText, ArrowUpRight } from 'lucide-react';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import type { EstadoCotizacion } from '@prisma/client';

interface Cotizacion {
  id: number;
  numero: string;
  total: number | null;
  estado: EstadoCotizacion;
  created_at: string;
  total_items: number;
}

interface RecentQuotesProps {
  cotizaciones: Cotizacion[];
}

export function RecentQuotes({ cotizaciones }: RecentQuotesProps) {
  return (
    <div className="bg-white border border-guor-line rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-guor-line flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-guor-ink tracking-tight">Cotizaciones Recientes</h2>
          <p className="text-[10px] font-bold text-guor-soft uppercase tracking-wider mt-0.5">Presupuestos activos</p>
        </div>
        <Link href="/portal/cotizaciones" className="text-[11px] font-bold text-guor-600 uppercase tracking-wider hover:underline">
          Ver todas
        </Link>
      </div>

      {cotizaciones.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-guor-bg border-b border-guor-line">
                {['Documento', 'Total', 'Estado', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-bold text-guor-soft uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-guor-line/50">
              {cotizaciones.map((c) => (
                <tr key={c.id} className="hover:bg-guor-50/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-guor-ink">{c.numero}</span>
                      <span className="text-[10px] text-guor-soft font-medium mt-0.5">{formatDateLong(c.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-bold text-guor-ink">{formatCurrency(c.total ?? 0)}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <EstadoBadge estado={c.estado} tipo="cotizacion" />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link href={`/portal/cotizaciones/${c.id}`} className="text-guor-500 hover:text-guor-600 hover:scale-110 transition-all inline-block p-1">
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center space-y-2">
          <FileText size={36} className="mx-auto text-guor-200" />
          <p className="text-guor-soft font-bold uppercase text-[10px] tracking-wider">No hay solicitudes recientes</p>
        </div>
      )}
    </div>
  );
}
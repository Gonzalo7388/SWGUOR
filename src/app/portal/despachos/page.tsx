'use client';

import { Truck, Loader2, AlertCircle } from 'lucide-react';
import CardDespacho from '@/components/portal/despachos/CardDespacho';
import { useDespachos } from '@/lib/hooks/useDespachos';

export default function DespachosPage() {
  const { despachos, cargando, error, refetch } = useDespachos();

  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">

      {/* ── Hero ── */}
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">
            Logística
          </p>
          <h1 className="text-3xl md:text-4xl font-serif leading-tight">
            Seguimiento de{' '}
            <span className="text-[#B8962D] italic">Despachos</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[#6D5A5A] leading-relaxed">
            Monitorea la ruta y tiempo estimado de llegada de cada envío en tiempo real.
          </p>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Contador */}
        {!cargando && !error && (
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#4A3737] uppercase tracking-widest">
              Envíos activos
            </h2>
            <span className="text-xs text-[#8A7676]">
              {despachos.length} despacho{despachos.length !== 1 ? 's' : ''} en curso
            </span>
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 text-[#D4AF37] animate-spin" />
            <p className="text-sm text-[#8A7676]">Cargando despachos…</p>
          </div>
        )}

        {/* Error */}
        {!cargando && error && (
          <div className="flex items-start gap-3 bg-[#FCEBEB] border border-[#F09595] rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-[#A32D2D] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#A32D2D]">
                Error al cargar despachos
              </p>
              <p className="text-xs text-[#993C1D] mt-0.5">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="text-xs font-bold text-[#A32D2D] hover:text-[#7A1F1F] uppercase tracking-wider transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!cargando && !error && despachos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Truck className="w-10 h-10 text-[#D4AF37]/40" />
            <p className="text-sm font-semibold text-[#4A3737]">Sin despachos activos</p>
            <p className="text-xs text-[#8A7676]">
              No hay envíos en tránsito en este momento.
            </p>
          </div>
        )}

        {/* Lista de despachos */}
        {!cargando && !error && despachos.map((d) => (
          <CardDespacho key={d.id} despacho={d} />
        ))}
      </main>
    </div>
  );
}
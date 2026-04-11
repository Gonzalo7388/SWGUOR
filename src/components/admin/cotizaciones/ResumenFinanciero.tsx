'use client';

import { Calculator } from 'lucide-react';

interface ResumenFinancieroProps {
  subtotalGeneral: number;
  igv: number;
  total: number;
  tasa: number;
  esExportacion: boolean;
  simboloMoneda: string;
}

export function ResumenFinanciero({
  subtotalGeneral,
  igv,
  total,
  tasa,
  esExportacion,
  simboloMoneda,
}: ResumenFinancieroProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-6">
        <Calculator size={24} className="text-blue-400" />
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Resumen Financiero
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subtotal General */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-2">
            Subtotal General
          </p>
          <p className="text-3xl font-black">
            {simboloMoneda}{' '}
            {subtotalGeneral.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* IGV */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-2">
            IGV{' '}
            {esExportacion
              ? '(Exportación)'
              : `(${(tasa * 100).toFixed(0)}%)`}
          </p>
          <p className="text-3xl font-black">
            {simboloMoneda}{' '}
            {igv.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
            })}
          </p>
          {esExportacion && (
            <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase">
              ✓ Exonerado por exportación
            </p>
          )}
        </div>

        {/* Total */}
        <div className="bg-blue-600/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-400/50">
          <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-2">
            Total
          </p>
          <p className="text-4xl font-black text-blue-100">
            {simboloMoneda}{' '}
            {total.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

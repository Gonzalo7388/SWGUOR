'use client';

import { Calculator, TrendingDown, Receipt } from 'lucide-react';

interface ResumenFinancieroProps {
  subtotalGeneral: number;
  igv:             number;
  total:           number;
  tasa:            number;
  esExportacion:   boolean;
  simboloMoneda:   string;
  cantidadItems?:  number;
}

function MontoBox({
  label, valor, simbolo, variant = 'default',
}: {
  label: string; valor: number; simbolo: string; variant?: 'default' | 'total' | 'muted';
}) {
  const styles = {
    default: 'bg-white/10 backdrop-blur-sm border border-white/20',
    total:   'bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50',
    muted:   'bg-white/5 backdrop-blur-sm border border-white/10',
  };
  const textStyles = {
    default: 'text-3xl font-black text-white',
    total:   'text-4xl font-black text-blue-100',
    muted:   'text-2xl font-black text-white/70',
  };

  return (
    <div className={`rounded-2xl p-6 ${styles[variant]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">{label}</p>
      <p className={textStyles[variant]}>
        {simbolo} {valor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function ResumenFinanciero({
  subtotalGeneral,
  igv,
  total,
  tasa,
  esExportacion,
  simboloMoneda,
  cantidadItems,
}: ResumenFinancieroProps) {
  const labelIgv = esExportacion
    ? 'IGV (Exportación — exonerado)'
    : `IGV (${(tasa * 100).toFixed(0)}%)`;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator size={22} className="text-blue-400" />
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Resumen Financiero
          </h2>
        </div>
        {cantidadItems !== undefined && (
          <span className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-black rounded-full uppercase tracking-widest">
            {cantidadItems} {cantidadItems === 1 ? 'ítem' : 'ítems'}
          </span>
        )}
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MontoBox
          label="Subtotal general"
          valor={subtotalGeneral}
          simbolo={simboloMoneda}
        />

        <div className={`rounded-2xl p-6 bg-white/10 backdrop-blur-sm border border-white/20`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">
            {labelIgv}
          </p>
          <p className="text-3xl font-black text-white">
            {simboloMoneda} {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          {esExportacion && (
            <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase flex items-center gap-1">
              <TrendingDown size={11} /> Exonerado por exportación
            </p>
          )}
        </div>

        <div className="rounded-2xl p-6 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={13} className="text-blue-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
              Total a facturar
            </p>
          </div>
          <p className="text-4xl font-black text-blue-100">
            {simboloMoneda} {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          {!esExportacion && tasa > 0 && (
            <p className="text-[10px] text-blue-300 font-bold mt-2">
              Incluye IGV del {(tasa * 100).toFixed(0)}%
            </p>
          )}
        </div>
      </div>

      {/* Alerta si total es 0 */}
      {total === 0 && (
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-widest">
            Agrega productos para calcular el total
          </p>
        </div>
      )}
    </div>
  );
}
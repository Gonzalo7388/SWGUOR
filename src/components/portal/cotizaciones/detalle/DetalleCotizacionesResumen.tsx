'use client';

import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers/format-helpers';

interface DetalleCotizacionResumenProps {
    subtotal: number;
    descuento: number;
    igv: number;
    costoEnvio: number | null;
    total: number;
    notasInternas?: string | null;
}

export function DetalleCotizacionResumen({
    subtotal,
    descuento,
    igv,
    costoEnvio,
    total,
    notasInternas,
}: DetalleCotizacionResumenProps) {
    return (
        <div className="space-y-4">
            {/* Card de análisis con IA — Más compacto y elegante */}
            <div
                className="rounded-xl p-5 text-white shadow-sm relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, var(--guor-dark) 0%, #1c1c1c 100%)',
                }}
            >
                <div className="absolute top-0 right-0 p-3 opacity-5">
                    <Sparkles size={60} style={{ color: 'var(--guor-gold)' }} />
                </div>

                <div className="flex items-center gap-2 mb-3 relative z-10">
                    <div className="p-1.5 bg-white/5 rounded-md border border-white/10">
                        <Sparkles size={14} style={{ color: 'var(--guor-gold)' }} />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest" style={{ color: 'var(--guor-gold)' }}>
                        Análisis Estratégico
                    </h3>
                </div>

                <p className="text-xs leading-relaxed italic font-medium relative z-10 opacity-90">
                    "{notasInternas ||
                        'Su volumen actual le permite acceder a la tarifa preferencial. Recomendamos aumentar el pedido para optimizar costos.'}"
                </p>

                <div
                    className="mt-4 pt-3 border-t flex items-center justify-between text-[9px] font-bold uppercase tracking-widest relative z-10 opacity-50"
                    style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}
                >
                    <span>Smart Insight</span>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>Optimizado</span>
                    </div>
                </div>
            </div>

            {/* Resumen Financiero — Estilizado y balanceado */}
            <div
                className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
                style={{ borderColor: 'var(--guor-stone)' }}
            >
                <h3
                    className="font-black text-[10px] uppercase tracking-widest border-b pb-3"
                    style={{
                        color: 'var(--guor-dark)',
                        borderColor: 'var(--guor-stone)',
                    }}
                >
                    Desglose Comercial
                </h3>

                <div className="space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-xs">
                        <span
                            className="font-bold uppercase tracking-tight opacity-60"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Subtotal Neto
                        </span>
                        <span
                            className="font-bold tabular-nums text-sm"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            {formatCurrency(subtotal)}
                        </span>
                    </div>

                    {/* Descuento */}
                    {descuento > 0 && (
                        <div
                            className="flex justify-between items-center p-2.5 rounded-lg border text-xs"
                            style={{
                                backgroundColor: 'var(--guor-cream)',
                                borderColor: 'var(--guor-stone)',
                            }}
                        >
                            <span
                                className="font-black uppercase tracking-wider text-[11px]"
                                style={{ color: 'var(--guor-gold)' }}
                            >
                                Ahorro corporativo
                            </span>
                            <span
                                className="font-black tabular-nums"
                                style={{ color: 'var(--guor-gold)' }}
                            >
                                -{formatCurrency(descuento)}
                            </span>
                        </div>
                    )}

                    {/* Impuestos */}
                    <div className="flex justify-between items-center text-xs">
                        <span
                            className="font-bold uppercase tracking-tight opacity-60"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Impuestos (18%)
                        </span>
                        <span
                            className="font-bold tabular-nums text-sm"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            {formatCurrency(igv)}
                        </span>
                    </div>

                    {/* Envío */}
                    <div className="flex justify-between items-center text-xs">
                        <span
                            className="font-bold uppercase tracking-tight opacity-60"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Envío
                        </span>
                        <span
                            className="font-bold tabular-nums text-sm"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            {formatCurrency(costoEnvio ?? 0)}
                        </span>
                    </div>

                    {/* Total - Rediseñado para tener un tamaño integrado y simétrico */}
                    <div
                        className="pt-4 border-t"
                        style={{ borderColor: 'var(--guor-stone)' }}
                    >
                        <div className="flex justify-between items-center">
                            <span
                                className="text-xs font-black uppercase tracking-widest"
                                style={{ color: 'var(--guor-dark)' }}
                            >
                                Total Final
                            </span>
                            <span
                                className="text-base font-black tabular-nums border-b-2 pb-0.5"
                                style={{
                                    color: 'var(--guor-dark)',
                                    borderColor: 'var(--guor-gold)'
                                }}
                            >
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Aviso de condiciones — Reducido para no competir visualmente */}
                <div
                    className="rounded-lg p-3.5 flex gap-2.5 items-start border text-[11px]"
                    style={{
                        backgroundColor: 'var(--guor-cream)',
                        borderColor: 'var(--guor-stone)',
                    }}
                >
                    <AlertCircle
                        size={16}
                        style={{ color: 'var(--guor-gold-warm)' }}
                        className="shrink-0 mt-0.5"
                    />
                    <div className="space-y-0.5">
                        <p
                            className="font-black uppercase tracking-wider text-[10px]"
                            style={{ color: 'var(--guor-gold-warm)' }}
                        >
                            Condiciones de Venta
                        </p>
                        <p
                            className="font-medium leading-relaxed opacity-80"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Cotización sujeta a MOQ de 400 unidades. Validez de precios por 7 días calendario tras la emisión.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
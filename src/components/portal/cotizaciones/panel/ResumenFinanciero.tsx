'use client';

import { formatCurrency } from '@/lib/helpers/format-helpers';
import { SelectorZonaEnvio } from './SelectorZonaEnvio';
import { usePortal } from '@/lib/hooks/usePortal';

export function ResumenFinanciero() {
    // Corregido: Extraemos 'resumenBorrador' en lugar de la propiedad global antigua
    const { resumenBorrador } = usePortal();

    return (
        <div className="space-y-2">

            {/* Subtotal */}
            <div className="flex justify-between items-center text-xs">
                <span className="text-guor-soft">
                    Subtotal ({resumenBorrador.total_unidades.toLocaleString()} uds)
                </span>
                <span className="font-bold text-guor-dark tabular-nums">
                    {formatCurrency(resumenBorrador.subtotal)}
                </span>
            </div>

            {/* Descuento */}
            {resumenBorrador.descuento_pct > 0 && (
                <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-medium">
                        Descuento {resumenBorrador.descuento_pct}%
                    </span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                        − {formatCurrency(resumenBorrador.descuento_monto)}
                    </span>
                </div>
            )}

            {/* IGV */}
            <div className="flex justify-between items-center text-xs">
                <span className="text-guor-soft">IGV 18%</span>
                <span className="font-bold text-guor-dark tabular-nums">
                    {formatCurrency(resumenBorrador.igv)}
                </span>
            </div>

            {/* Envío */}
            <SelectorZonaEnvio />

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-guor-stone">
                <span className="text-sm font-black text-guor-dark uppercase tracking-tight">
                    Total a pagar
                </span>
                <span className="text-lg font-black text-guor-gold tabular-nums">
                    {formatCurrency(resumenBorrador.total)}
                </span>
            </div>
        </div>
    );
}
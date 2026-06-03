'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    convertirCotizacionAPedido,
    recotizarCotizacion
} from '@/app/portal/cotizaciones/actions';
import {
    mensajeErrorConversion,
    mensajeErrorRecotizacion
} from '@/app/portal/cotizaciones/cotizacion-errors';

interface DetalleCotizacionHeaderProps {
    cotizacionId: number;
    numero: string;
    estado: string;
    onVolver: () => void;
    onDescargarPDF?: () => void;
    /** Llamado tras una conversión exitosa con el id del pedido creado */
    onConvertida?: (pedidoId: number, numeroPedido: string) => void;
    /** Llamado tras una recotización exitosa con el id de la nueva cotización */
    onRecotizada?: (nuevaCotizacionId: number) => void;
}

export function DetalleCotizacionHeader({
    cotizacionId,
    numero,
    estado,
    onVolver,
    onDescargarPDF,
    onConvertida,
    onRecotizada,
}: DetalleCotizacionHeaderProps) {
    const router = useRouter();
    const [convirtiendo, setConvirtiendo] = useState(false);
    const [recotizando, setRecotizando] = useState(false);

    // Solo las cotizaciones aprobadas pueden convertirse en pedido
    const puedeConvertir = estado === 'aprobada';

    // Puede recotizarse en cualquier estado excepto borrador
    const puedeRecotizar = estado !== 'borrador';

    // ── Convertir a pedido ────────────────────────────────────────────────────
    const handleConvertir = async () => {
        setConvirtiendo(true);
        const tid = toast.loading('Convirtiendo cotización en pedido...');
        try {
            const result = await convertirCotizacionAPedido(cotizacionId);

            if (!result.success) {
                toast.error(mensajeErrorConversion(result.error), { id: tid });
                return;
            }

            toast.success(
                `Pedido ${result.numeroPedido} creado correctamente.`,
                { id: tid },
            );

            if (onConvertida) {
                onConvertida(result.pedidoId, result.numeroPedido);
            } else {
                // Navegación por defecto al pedido recién creado
                router.push(`/portal/pedidos/${result.pedidoId}`);
            }
        } catch {
            toast.error('Ocurrió un error inesperado. Intenta nuevamente.', { id: tid });
        } finally {
            setConvirtiendo(false);
        }
    };

    // ── Recotizar ─────────────────────────────────────────────────────────────
    const handleRecotizar = async () => {
        setRecotizando(true);
        const tid = toast.loading('Generando recotización...');
        try {
            const result = await recotizarCotizacion(cotizacionId);

            if (!result.success) {
                toast.error(mensajeErrorRecotizacion(result.error), { id: tid });
                return;
            }

            toast.success(
                `Recotización ${result.numero} creada correctamente.`,
                { id: tid },
            );

            if (onRecotizada) {
                onRecotizada(result.id);
            } else {
                // Navegar a la nueva cotización por defecto
                router.push(`/portal/cotizaciones/${result.id}`);
            }
        } catch {
            toast.error('Ocurrió un error inesperado al recotizar.', { id: tid });
        } finally {
            setRecotizando(false);
        }
    };

    const cargando = convirtiendo || recotizando;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Botón volver */}
            <button
                onClick={onVolver}
                className="flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100"
                style={{ color: 'var(--guor-dark)' }}
            >
                <ArrowLeft size={16} />
                Volver al historial
            </button>

            {/* Acciones */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Exportar PDF */}
                {onDescargarPDF && (
                    <button
                        onClick={onDescargarPDF}
                        className="flex items-center gap-2 px-5 py-2.5 border rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                        style={{
                            borderColor: 'var(--guor-stone)',
                            color: 'var(--guor-dark)',
                            backgroundColor: '#ffffff',
                        }}
                    >
                        <Download size={18} />
                        Exportar PDF
                    </button>
                )}

                {/* Recotizar */}
                {puedeRecotizar && (
                    <button
                        onClick={handleRecotizar}
                        disabled={cargando}
                        className="flex items-center gap-2 px-5 py-2.5 border rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            borderColor: 'var(--guor-stone)',
                            color: 'var(--guor-dark)',
                            backgroundColor: '#ffffff',
                        }}
                    >
                        {recotizando
                            ? <Loader2 size={18} className="animate-spin" />
                            : <RefreshCw size={18} />}
                        {recotizando ? 'Recotizando...' : 'Recotizar'}
                    </button>
                )}

                {/* Convertir a pedido — solo aprobadas */}
                {puedeConvertir && (
                    <button
                        onClick={handleConvertir}
                        disabled={cargando}
                        className="flex items-center gap-2 text-white px-8 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--guor-gold)' }}
                    >
                        {convirtiendo && <Loader2 size={18} className="animate-spin" />}
                        {convirtiendo ? 'Procesando...' : 'Aprobar y Confirmar Pedido'}
                    </button>
                )}
            </div>
        </div>
    );
}
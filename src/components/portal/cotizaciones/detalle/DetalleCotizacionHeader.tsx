'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import {
    convertirCotizacionAPedido,
    recotizarCotizacion
} from '@/app/portal/cotizaciones/actions';
import {
    mensajeErrorConversion,
    mensajeErrorRecotizacion
} from '@/app/portal/cotizaciones/cotizacion-errors';

interface DetalleCotizacionHeaderProps {
    numero: string;
    estado: string;
    fechaCreacion: string;
    total: number;
    clienteNombre: string;
    clienteRUC?: string;
    cotizacionId: number;
    onVolver: () => void;
    onDescargarPDF?: () => void;
    descargandoPDF?: boolean;
    onConvertida?: (pedidoId: number, numeroPedido: string) => void;
    onRecotizada?: (nuevaCotizacionId: number) => void;
}

export function DetalleCotizacionHeader({
    cotizacionId,
    numero,
    estado,
    fechaCreacion,
    total,
    clienteNombre,
    clienteRUC,
    onVolver,
    onDescargarPDF,
    descargandoPDF,
    onConvertida,
    onRecotizada,
}: DetalleCotizacionHeaderProps) {
    const router = useRouter();
    const [convirtiendo, setConvirtiendo] = useState(false);
    const [recotizando, setRecotizando] = useState(false);

    const puedeConvertir = estado === 'aprobada';
    const puedeRecotizar = estado !== 'borrador';

    const handleConvertir = async () => {
        setConvirtiendo(true);
        const tid = toast.loading('Convirtiendo cotización en pedido...');
        try {
            const result = await convertirCotizacionAPedido(cotizacionId);
            if (!result.success) {
                toast.error(mensajeErrorConversion(result.error), { id: tid });
                return;
            }
            toast.success(`Pedido ${result.numeroPedido} creado correctamente.`, { id: tid });
            if (onConvertida) {
                onConvertida(result.pedidoId, result.numeroPedido);
            } else {
                router.push(`/portal/pedidos/${result.pedidoId}`);
            }
        } catch {
            toast.error('Ocurrió un error inesperado. Intenta nuevamente.', { id: tid });
        } finally {
            setConvirtiendo(false);
        }
    };

    const handleRecotizar = async () => {
        setRecotizando(true);
        const tid = toast.loading('Generando recotización...');
        try {
            const result = await recotizarCotizacion(cotizacionId);
            if (!result.success) {
                toast.error(mensajeErrorRecotizacion(result.error), { id: tid });
                return;
            }
            toast.success(`Recotización ${result.numero} creada correctamente.`, { id: tid });
            if (onRecotizada) {
                onRecotizada(result.id);
            } else {
                router.push(`/portal/cotizaciones/${result.id}`);
            }
        } catch {
            toast.error('Ocurrió un error inesperado al recotizar.', { id: tid });
        } finally {
            setRecotizando(false);
        }
    };

    const cargando = convirtiendo || recotizando;

    // Helper para limpiar la visualización de la fecha
    const formatFecha = (fechaStr: string) => {
        try {
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) return fechaStr;
            return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return fechaStr;
        }
    };

    return (
        <div className="space-y-5 w-full">
            {/* Fila Principal: Navegación y Botones de Acción */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Botón volver */}
                <button
                    onClick={onVolver}
                    className="flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 shrink-0 self-start sm:self-auto"
                    style={{ color: 'var(--guor-dark)' }}
                >
                    <ArrowLeft size={14} />
                    Volver al historial
                </button>

                {/* Acciones conjuntas a la derecha */}
                <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                    {onDescargarPDF && (
                        <button
                            onClick={onDescargarPDF}
                            disabled={cargando || descargandoPDF}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:bg-neutral-50 disabled:opacity-50"
                            style={{
                                borderColor: 'var(--guor-stone)',
                                color: 'var(--guor-dark)',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <Download size={14} />
                            Exportar PDF
                        </button>
                    )}

                    {puedeRecotizar && (
                        <button
                            onClick={handleRecotizar}
                            disabled={cargando}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                borderColor: 'var(--guor-stone)',
                                color: 'var(--guor-dark)',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            {recotizando ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Recotizar
                        </button>
                    )}

                    {puedeConvertir && (
                        <button
                            onClick={handleConvertir}
                            disabled={cargando}
                            className="flex items-center gap-2 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-all hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--guor-gold)' }}
                        >
                            {convirtiendo && <Loader2 size={14} className="animate-spin" />}
                            Aprobar y Confirmar Pedido
                        </button>
                    )}
                </div>
            </div>

            {/* Fila Secundaria: Barra Informativa de Metadata — Limpia y Compacta */}
            <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border text-xs"
                style={{
                    backgroundColor: 'var(--guor-cream)',
                    borderColor: 'var(--guor-stone)'
                }}
            >
                <div className="space-y-0.5">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--guor-dark)' }}>
                        Cotización
                    </span>
                    <span className="font-bold tracking-tight text-neutral-800 block">
                        {numero}
                    </span>
                </div>

                <div className="space-y-0.5">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--guor-dark)' }}>
                        Cliente
                    </span>
                    <span className="font-bold text-neutral-800 block truncate" title={clienteNombre}>
                        {clienteNombre}
                    </span>
                    {clienteRUC && (
                        <span className="text-[10px] font-medium opacity-60 block" style={{ color: 'var(--guor-dark)' }}>
                            RUC: {clienteRUC}
                        </span>
                    )}
                </div>

                <div className="space-y-0.5">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--guor-dark)' }}>
                        Fecha Emisión
                    </span>
                    <span className="font-semibold text-neutral-700 block">
                        {formatFecha(fechaCreacion)}
                    </span>
                </div>

                <div className="space-y-0.5">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--guor-dark)' }}>
                        Total
                    </span>
                    <span
                        className="text-sm font-black tabular-nums block"
                        style={{ color: 'var(--guor-dark)' }}
                    >
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>
        </div>
    );
}
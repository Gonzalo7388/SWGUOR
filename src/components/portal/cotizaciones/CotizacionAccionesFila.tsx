'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit3, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportCotizacionIndividualToPDF, buildCotizacionPDFData } from '@/lib/utils/export-utils';
import {
    recotizarCotizacion,
    mensajeErrorRecotizacion,
} from '@/app/portal/cotizaciones/actions';
import type { EstadoCotizacion } from '@prisma/client';

export interface CotizacionFila {
    id: number;
    numero: string;
    total: number;
    estado: EstadoCotizacion;
    created_at: string;
    valida_hasta: string;
}

interface Props {
    cot: CotizacionFila;
    /** Callback opcional para notificar al padre que se creó una recotización */
    onRecotizar?: (id: number) => void;
}

export function CotizacionAccionesFila({ cot, onRecotizar }: Props) {
    const [descargando, setDescargando] = useState(false);
    const [recotizando, setRecotizando] = useState(false);

    // ── Descarga PDF ──────────────────────────────────────────────────────────
    const handleDescargarPDF = async () => {
        setDescargando(true);
        const tid = toast.loading('Generando PDF...');
        try {
            const res = await fetch(`/api/portal/cotizaciones/${cot.id}`);
            if (!res.ok) throw new Error('No se pudo obtener la cotización');
            const { data } = await res.json();
            const pdfData = buildCotizacionPDFData(data, data.cotizacion_items ?? []);
            await exportCotizacionIndividualToPDF(pdfData);
            toast.success('PDF descargado', { id: tid });
        } catch {
            toast.error('Error al generar PDF', { id: tid });
        } finally {
            setDescargando(false);
        }
    };

    // ── Recotizar ─────────────────────────────────────────────────────────────
    const handleRecotizar = async () => {
        setRecotizando(true);
        const tid = toast.loading('Generando recotización...');
        try {
            const result = await recotizarCotizacion(cot.id);

            if (!result.success) {
                toast.error(mensajeErrorRecotizacion(result.error), { id: tid });
                return;
            }

            toast.success(
                `Recotización ${result.numero} creada correctamente.`,
                { id: tid },
            );
            onRecotizar?.(result.id);
        } catch {
            toast.error('Ocurrió un error inesperado al recotizar.', { id: tid });
        } finally {
            setRecotizando(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Ver detalle — siempre visible */}
            <Link
                href={`/portal/cotizaciones/${cot.id}`}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                title="Ver detalle"
            >
                <Eye size={18} />
            </Link>

            {/* Editar — solo borradores */}
            {cot.estado === 'borrador' && (
                <Link
                    href={`/portal/cotizaciones/${cot.id}/editar`}
                    className="p-2.5 text-white bg-guor-gold rounded-xl hover:bg-guor-700 shadow-sm"
                    title="Editar borrador"
                >
                    <Edit3 size={18} />
                </Link>
            )}

            {/* Descargar PDF — cualquier estado excepto borrador */}
            {cot.estado !== 'borrador' && (
                <button
                    onClick={handleDescargarPDF}
                    disabled={descargando}
                    className="p-2.5 text-white bg-guor-gold rounded-xl hover:bg-guor-700 shadow-sm disabled:opacity-50"
                    title="Descargar PDF"
                >
                    {descargando
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Download size={18} />}
                </button>
            )}

            {/* Recotizar — cualquier estado excepto borrador */}
            {cot.estado !== 'borrador' && (
                <button
                    onClick={handleRecotizar}
                    disabled={recotizando}
                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
                    title="Recotizar"
                >
                    {recotizando
                        ? <Loader2 size={18} className="animate-spin" />
                        : <RefreshCw size={18} />}
                </button>
            )}
        </div>
    );
}
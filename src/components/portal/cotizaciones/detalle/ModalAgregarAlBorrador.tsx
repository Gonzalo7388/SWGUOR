'use client';

import { useState, CSSProperties } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { COLOR_MAP } from '@/lib/constants/colores';
import { usePortal } from '@/lib/hooks/usePortal';
import { MOQ_MINIMO, type AgregarCotizacionPayload } from '@/components/portal/_contexts/PortalContext';

interface VarianteBackend {
    id: number;
    color: string;
    talla: string;
    stock: number;
    precio_adicional: number;
    sku: string;
    imagen_url: string | null;
}

interface ProductoParaModal {
    id: number;
    nombre: string;
    sku: string;
    imagen: string | null;
    precio: number;
    colores_disponibles: string[];
    tallas_disponibles: string[];
    tallas_por_color: Record<string, string[]>;
    variantes: VarianteBackend[];
}

interface Props {
    producto: ProductoParaModal;
    onClose: () => void;
}

const formatearColor = (color: string) =>
    color.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export function ModalAgregarAlBorrador({ producto, onClose }: Props) {
    // Corregido: Extraemos 'agregarACotizacion' que se encarga del flujo exclusivo del borrador
    const { agregarACotizacion } = usePortal();
    const colores = producto.colores_disponibles ?? [];
    const [colorSel, setColorSel] = useState<string>(colores[0] ?? '');
    const [tallaSel, setTallaSel] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(MOQ_MINIMO);

    const tallas = producto.tallas_por_color?.[colorSel] ?? producto.tallas_disponibles ?? [];
    const tallaActual = tallaSel || tallas[0] || '';

    const varianteSel = producto.variantes.find(
        v => v.color === colorSel && v.talla === tallaActual,
    );

    const precioFinal = producto.precio + (varianteSel?.precio_adicional ?? 0);
    const subtotal = precioFinal * Math.max(1, cantidad);

    const handleAgregar = () => {
        if (!varianteSel) { toast.error('Selecciona color y talla'); return; }

        const payload: AgregarCotizacionPayload = {
            variante_id: varianteSel.id,
            producto_id: producto.id,
            cantidad,
            nombre: producto.nombre,
            sku: producto.sku,
            imagen: producto.imagen,
            color: colorSel,
            talla: tallaActual,
            precio_unitario: precioFinal,
        };

        agregarACotizacion(payload);
        toast.success(`${producto.nombre} agregado al borrador`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: 'var(--guor-cream, #fff4e2)' }}
            >
                {/* ── Encabezado ── */}
                <div
                    className="flex items-start justify-between px-6 pt-6 pb-4"
                    style={{ backgroundColor: 'var(--guor-cream, #fff4e2)' }}
                >
                    <div>
                        <h2
                            className="text-lg font-black uppercase tracking-tight leading-tight"
                            style={{ color: 'var(--guor-dark, #231e1d)' }}
                        >
                            {producto.nombre}
                        </h2>
                        <p
                            className="text-[11px] font-bold uppercase tracking-widest mt-0.5"
                            style={{ color: 'var(--guor-gold, #b5854b)' }}
                        >
                            {producto.sku}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10"
                        style={{ color: 'var(--guor-dark, #231e1d)' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-5">

                    {/* ── Selector de color — swatches circulares ── */}
                    <div>
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                            style={{ color: 'var(--guor-dark, #231e1d)', opacity: 0.5 }}
                        >
                            Color —{' '}
                            <span style={{ opacity: 1, fontWeight: 700, textTransform: 'none', letterSpacing: 'normal' }}>
                                {colorSel ? formatearColor(colorSel) : 'Ninguno'}
                            </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {colores.map(c => {
                                const activo = colorSel === c;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        title={formatearColor(c)}
                                        onClick={() => { setColorSel(c); setTallaSel(''); }}
                                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                        style={{
                                            backgroundColor: COLOR_MAP[c] ?? '#e5e7eb',
                                            borderColor: activo ? 'var(--guor-dark, #231e1d)' : 'transparent',
                                            outline: activo
                                                ? '2px solid var(--guor-dark, #231e1d)'
                                                : '1px solid #d1c9be',
                                            outlineOffset: activo ? '2px' : '0px',
                                        } as CSSProperties}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Selector de talla ── */}
                    {tallas.length > 0 && (
                        <div>
                            <p
                                className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                                style={{ color: 'var(--guor-dark, #231e1d)', opacity: 0.5 }}
                            >
                                Talla disponible
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tallas.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTallaSel(t)}
                                        className="w-12 h-10 rounded-xl text-xs font-bold border transition-all"
                                        style={{
                                            backgroundColor: tallaActual === t
                                                ? 'var(--guor-dark, #231e1d)'
                                                : 'white',
                                            color: tallaActual === t
                                                ? 'var(--guor-cream, #fff4e2)'
                                                : 'var(--guor-dark, #231e1d)',
                                            borderColor: tallaActual === t
                                                ? 'var(--guor-dark, #231e1d)'
                                                : 'var(--guor-stone, #e2d9cf)',
                                        } as CSSProperties}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Precio unitario ── */}
                    <div
                        className="grid grid-cols-1 rounded-2xl p-4 border"
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'var(--guor-stone, #e2d9cf)',
                        }}
                    >
                        <div>
                            <p
                                className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                                style={{ color: 'var(--guor-dark, #231e1d)', opacity: 0.4 }}
                            >
                                Precio unitario
                            </p>
                            <p
                                className="text-lg font-black"
                                style={{ color: 'var(--guor-gold, #b5854b)' }}
                            >
                                S/ {precioFinal.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* ── Cantidad ── */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p
                                className="text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{ color: 'var(--guor-dark, #231e1d)', opacity: 0.5 }}
                            >
                                Cantidad a solicitar
                            </p>
                            <p
                                className="text-[10px] font-bold"
                                style={{ color: 'var(--guor-gold, #b5854b)' }}
                            >
                                Mínimo corporativo: {MOQ_MINIMO.toLocaleString()} uds
                            </p>
                        </div>
                        <input
                            type="number"
                            min={1}
                            value={cantidad}
                            onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full h-12 text-center text-lg font-bold border rounded-2xl focus:outline-none focus:ring-2 transition-all bg-white"
                            style={{
                                borderColor: cantidad < MOQ_MINIMO
                                    ? '#f59e0b'
                                    : 'var(--guor-stone, #e2d9cf)',
                                color: 'var(--guor-dark, #231e1d)',
                                '--tw-ring-color': 'var(--guor-gold, #b5854b)',
                            } as CSSProperties}
                        />
                        {cantidad < MOQ_MINIMO && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">
                                Cantidad mínima: {MOQ_MINIMO.toLocaleString()} unidades
                            </p>
                        )}
                    </div>

                    {/* ── Subtotal estimado ── */}
                    <div
                        className="flex items-center justify-between rounded-2xl px-5 py-4 border"
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'var(--guor-stone, #e2d9cf)',
                        }}
                    >
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.2em]"
                            style={{ color: 'var(--guor-dark, #231e1d)', opacity: 0.5 }}
                        >
                            Subtotal estimado
                        </p>
                        <p
                            className="text-xl font-black"
                            style={{ color: 'var(--guor-dark, #231e1d)' }}
                        >
                            S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* ── Botón agregar ── */}
                    <button
                        type="button"
                        onClick={handleAgregar}
                        disabled={!varianteSel}
                        className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--guor-gold, #b5854b)',
                            color: 'white',
                        }}
                    >
                        Agregar al borrador
                    </button>
                </div>
            </div>
        </div>
    );
}
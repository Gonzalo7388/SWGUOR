'use client';

import { X, Info, Package } from 'lucide-react';
import { ProductoPortal } from '@/components/portal/_contexts/PortalContext';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { COLOR_MAP } from '@/lib/constants/colores';

interface DetallesProductoModalProps {
    producto: ProductoPortal | null;
    isOpen: boolean;
    onClose: () => void;
}

const formatearColor = (color: string) =>
    color.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export function DetallesProductoModal({ producto, isOpen, onClose }: DetallesProductoModalProps) {
    if (!isOpen || !producto) return null;

    const colores = (producto.colores_disponibles as string[]) || [];
    const tallas = (producto.tallas_disponibles as string[]) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-modal overflow-hidden animate-in zoom-in duration-200">

                {/* Encabezado */}
                <div className="p-6 border-b flex justify-between items-center bg-guor-50"
                    style={{ borderColor: 'var(--guor-stone)' }}>
                    <div>
                        <h2 className="text-xl font-black text-guor-dark">{producto.nombre}</h2>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1 text-guor-gold">
                            SKU: {producto.sku}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full transition-colors border bg-white hover:bg-guor-200 shadow-sm"
                        style={{ borderColor: 'var(--guor-stone-mid)', color: 'var(--guor-dark)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido Técnico */}
                <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">
                    <section>
                        <div className="flex items-center gap-2 mb-3 text-guor-400">
                            <Info size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Descripción</h3>
                        </div>
                        <p className="text-sm leading-relaxed p-4 rounded-2xl border text-guor-dark"
                            style={{ backgroundColor: 'var(--guor-cream)', borderColor: 'var(--guor-stone)' }}>
                            {producto.descripcion || "Sin descripción técnica disponible."}
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4 text-guor-400">
                            <Package size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Estructura del Modelo</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border text-sm"
                            style={{ backgroundColor: 'var(--guor-cream)', borderColor: 'var(--guor-stone)' }}>
                            {/* Colores Disponibles */}
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider mb-3 text-guor-400">
                                    Colores Habilitados
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {colores.map((c) => (
                                        <span
                                            key={c}
                                            title={formatearColor(c)}
                                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0 ring-1"
                                            style={{
                                                backgroundColor: COLOR_MAP[c] ?? '#e5e7eb',
                                                outline: '1px solid var(--guor-stone-mid)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tallas Disponibles */}
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider mb-3 text-guor-400">
                                    Tallas Disponibles
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tallas.map((t) => (
                                        <span
                                            key={t}
                                            className="bg-white px-2.5 py-1 rounded-lg font-black text-xs border text-guor-dark"
                                            style={{ borderColor: 'var(--guor-stone-mid)' }}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-right">
                            <p className="text-xs text-guor-400">
                                Precio:{' '}
                                <span className="font-bold text-sm text-guor-gold">
                                    {formatCurrency(producto.precio)}
                                </span>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { ProductoPortal } from '@/components/portal/_contexts/PortalContext';
import { COLOR_MAP } from '@/lib/constants/colores';

interface CatalogoProductoCardProps {
    producto: ProductoPortal;
    onSelect: (producto: ProductoPortal) => void;
    onQuickView?: (producto: ProductoPortal) => void;
}

const formatearColor = (color: string) =>
    color.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export function CatalogoProductoCard({
    producto,
    onSelect,
    onQuickView,
}: CatalogoProductoCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrecio = (valor: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(valor);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col h-full"
            style={{ borderColor: 'var(--guor-stone)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Contenedor de Imagen y Badges */}
            <div
                className="relative aspect-square w-full overflow-hidden flex items-center justify-center select-none"
                style={{ backgroundColor: 'var(--guor-cream)' }}
            >
                {producto.imagen ? (
                    <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        fill
                        sizes="(max-w-7xl) 25vw, 33vw"
                        priority={false}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="text-xs font-bold uppercase tracking-widest opacity-30" style={{ color: 'var(--guor-dark)' }}>
                        Sin Imagen
                    </div>
                )}

                {/* Capa de acción rápida al hacer Hover */}
                <div
                    className={`absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center gap-3 transition-opacity duration-300 z-10 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {onQuickView && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuickView(producto);
                            }}
                            className="p-3 bg-white rounded-full text-gray-800 hover:bg-gray-100 transition-all hover:scale-110 shadow-md"
                            title="Vista Rápida"
                        >
                            <Eye size={18} style={{ color: 'var(--guor-dark)' }} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(producto);
                        }}
                        className="p-3 rounded-full text-white transition-all hover:scale-110 shadow-md"
                        style={{ backgroundColor: 'var(--guor-gold)' }}
                        title="Configurar Pedido"
                    >
                        <ShoppingBag size={18} />
                    </button>
                </div>

                {/* Badges superiores */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
                    <div>
                        {producto.destacado && (
                            <span className="bg-white/90 backdrop-blur-xs text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-xs flex items-center gap-1 border border-amber-100" style={{ color: 'var(--guor-gold)' }}>
                                <Star size={10} className="fill-current" /> Destacado
                            </span>
                        )}
                    </div>
                    <span
                        className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-xs"
                        style={{ backgroundColor: 'var(--guor-dark)' }}
                    >
                        MOQ: {producto.moq || 400} uds
                    </span>
                </div>
            </div>

            {/* Cuerpo de Información */}
            <div className="p-4 flex flex-col flex-1 bg-white">
                <div className="mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 truncate mb-0.5" style={{ color: 'var(--guor-dark)' }}>
                        {producto.sku || 'SKU-PENDIENTE'}
                    </p>
                    <h3
                        className="text-xs font-black uppercase tracking-wider line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer"
                        style={{ color: 'var(--guor-dark)' }}
                        onClick={() => onSelect(producto)}
                    >
                        {producto.nombre}
                    </h3>
                </div>

                {/* Colores y Tallas */}
                <div className="space-y-2 mb-4 select-none">
                    {/* Círculos de color */}
                    {producto.colores_disponibles && producto.colores_disponibles.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {producto.colores_disponibles.slice(0, 8).map((color) => (
                                <span
                                    key={color}
                                    title={formatearColor(color)}
                                    className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0"
                                    style={{ backgroundColor: COLOR_MAP[color] ?? '#e5e7eb' }}
                                />
                            ))}
                            {producto.colores_disponibles.length > 8 && (
                                <span className="text-[9px] font-bold text-gray-400">
                                    +{producto.colores_disponibles.length - 8}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Tallas como cápsulas */}
                    {producto.tallas_disponibles && producto.tallas_disponibles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {producto.tallas_disponibles.map((talla) => (
                                <span
                                    key={talla}
                                    className="text-[9px] font-black px-1.5 py-0.5 rounded border"
                                    style={{ borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)' }}
                                >
                                    {talla}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Precio y Acción */}
                <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--guor-stone)' }}>
                    <div>
                        <span className="text-[9px] block font-bold uppercase tracking-wider opacity-40" style={{ color: 'var(--guor-dark)' }}>
                            Precio
                        </span>
                        <span className="text-sm font-black" style={{ color: 'var(--guor-gold)' }}>
                            {formatPrecio(producto.precio)}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onSelect(producto)}
                        className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-80 flex items-center gap-1"
                        style={{ color: 'var(--guor-dark)' }}
                    >
                        Nuevo Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}
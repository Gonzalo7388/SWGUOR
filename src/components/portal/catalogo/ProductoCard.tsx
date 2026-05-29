'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, Eye, Star, Loader2, CheckCircle } from 'lucide-react';
import { useCartStore, type CartState } from '@/lib/store/useCartStore';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';
import { usePortalCart } from '@/components/portal/cart/PortalCartLayout';
import { PromocionProductoBadge } from '@/components/portal/PromocionProductoBadge';
import { COLOR_MAP } from '@/lib/constants/colores';
import { toast } from 'sonner';
import type { ProductoCampanaBadge } from '@/lib/services/portal-promociones-catalogo.service';
import type { ProductoBase } from '@/types/portal';

// ─── Tipo unificado ────────────────────────────────────────────────────────────
interface ProductoCardProps<T extends ProductoBase = ProductoBase> {
    producto: T;
    onSelect?: (producto: T) => void;
    onQuickView?: (producto: T) => void;
    promociones?: ProductoCampanaBadge[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PROJECT_ID = 'fkpvmgfsopjhvorckoat';
const BUCKET_NAME = 'productos';
const PUBLIC_STORAGE_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/`;

function resolveImageUrl(imagen: string | null): string | null {
    if (!imagen) return null;
    return imagen.startsWith('http') ? imagen : `${PUBLIC_STORAGE_URL}${imagen}`;
}

function formatearColor(color: string) {
    return color.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatPrecio(valor: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function ProductoCard<T extends ProductoBase>({ producto, onSelect, onQuickView, promociones = [] }: ProductoCardProps<T>) {
    const addItem = useCartStore((s: CartState) => s.addItem);
    const { openCart } = usePortalCart();

    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const imageUrl = resolveImageUrl(producto.imagen);
    const moqProducto = resolveCartMoq(producto.moq);
    const variantes = producto.variantes ?? producto.variantes_producto ?? [];

    // Modo carrito directo (sin onSelect)
    const handleAgregarCarrito = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const variante = variantes.find((v) => Number(v.stock ?? 0) > 0) ?? variantes[0];

        if (!variante?.id) {
            toast.error('Sin variantes disponibles', {
                description: 'Este producto no tiene talla/color con stock.',
            });
            return;
        }

        setIsAdding(true);
        await new Promise((r) => setTimeout(r, 500));

        addItem(
            {
                producto_id: Number(producto.id),
                variante_id: Number(variante.id),
                nombre: producto.nombre,
                precio: producto.precio,
                moq: moqProducto,
                imagen_url: imageUrl,
                talla: variante.talla ?? producto.tallas_disponibles?.[0] ?? 'M',
                color: variante.color ?? producto.colores_disponibles?.[0] ?? 'Estándar',
            },
            moqProducto,
        );

        setIsAdding(false);
        setJustAdded(true);
        openCart();

        toast.success('Agregado al carrito', {
            description: `${producto.nombre} · mín. ${moqProducto} uds`,
            icon: <CheckCircle size={16} />,
            duration: 3000,
        });

        setTimeout(() => setJustAdded(false), 2000);
    };

    // Ícono del botón principal de acción en hover
    const ActionButton = () => {
        if (onSelect) {
            // Modo catálogo: abre configurador
            return (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelect(producto); }}
                    className="p-3 rounded-full text-white transition-all hover:scale-110 shadow-md"
                    style={{ backgroundColor: 'var(--guor-gold)' }}
                    title="Configurar Pedido"
                >
                    <ShoppingBag size={18} />
                </button>
            );
        }

        // Modo carrito directo
        return (
            <button
                type="button"
                onClick={handleAgregarCarrito}
                disabled={isAdding || justAdded}
                className="p-3 rounded-full text-white transition-all hover:scale-110 shadow-md disabled:cursor-not-allowed"
                style={{ backgroundColor: justAdded ? '#22c55e' : 'var(--guor-gold)' }}
                title={isAdding ? 'Agregando...' : 'Agregar al carrito'}
            >
                {isAdding
                    ? <Loader2 size={18} className="animate-spin" />
                    : justAdded
                        ? <CheckCircle size={18} />
                        : <ShoppingBag size={18} />}
            </button>
        );
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col h-full"
            style={{ borderColor: 'var(--guor-stone)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ── Imagen ─────────────────────────────────────────────────────────── */}
            <div
                className="relative aspect-square w-full overflow-hidden flex items-center justify-center select-none"
                style={{ backgroundColor: 'var(--guor-cream)' }}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={producto.nombre}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={false}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="text-xs font-bold uppercase tracking-widest opacity-30"
                        style={{ color: 'var(--guor-dark)' }}
                    >
                        Sin Imagen
                    </div>
                )}

                {/* Capa de acciones en hover */}
                <div
                    className={`absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center gap-3 transition-opacity duration-300 z-10 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {onQuickView && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onQuickView(producto); }}
                            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-all hover:scale-110 shadow-md"
                            title="Vista Rápida"
                        >
                            <Eye size={18} style={{ color: 'var(--guor-dark)' }} />
                        </button>
                    )}
                    <ActionButton />
                </div>

                {/* ── Badges superiores ──────────────────────────────────────────── */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
                    <div>
                        {producto.destacado && (
                            <span
                                className="bg-white/90 backdrop-blur-xs text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-xs flex items-center gap-1 border border-amber-100"
                                style={{ color: 'var(--guor-gold)' }}
                            >
                                <Star size={10} className="fill-current" /> Destacado
                            </span>
                        )}
                    </div>
                    <span
                        className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-xs"
                        style={{ backgroundColor: 'var(--guor-dark)' }}
                    >
                        MOQ: {moqProducto} uds
                    </span>
                </div>

                {/* Badges de promociones */}
                {promociones.length > 0 && <PromocionProductoBadge badges={promociones} />}
            </div>

            {/* ── Cuerpo ─────────────────────────────────────────────────────────── */}
            <div className="p-4 flex flex-col flex-1 bg-white">
                <div className="mb-2">
                    <p
                        className="text-[10px] font-bold uppercase tracking-widest opacity-40 truncate mb-0.5"
                        style={{ color: 'var(--guor-dark)' }}
                    >
                        {producto.sku || 'SKU-PENDIENTE'}
                    </p>
                    <h3
                        className="text-xs font-black uppercase tracking-wider line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer"
                        style={{ color: 'var(--guor-dark)' }}
                        onClick={() => onSelect?.(producto)}
                    >
                        {producto.nombre}
                    </h3>
                </div>

                {/* Colores */}
                <div className="space-y-2 mb-4 select-none">
                    {(producto.colores_disponibles?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {producto.colores_disponibles!.slice(0, 8).map((color) => (
                                <span
                                    key={color}
                                    title={formatearColor(color)}
                                    className="w-4 h-4 rounded-full border border-gray-200 inline-block shrink-0"
                                    style={{ backgroundColor: COLOR_MAP[color] ?? '#e5e7eb' }}
                                />
                            ))}
                            {producto.colores_disponibles!.length > 8 && (
                                <span className="text-[9px] font-bold text-gray-400">
                                    +{producto.colores_disponibles!.length - 8}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Tallas */}
                    {(producto.tallas_disponibles?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {producto.tallas_disponibles!.map((talla) => (
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

                {/* Precio y acción */}
                <div
                    className="mt-auto pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--guor-stone)' }}
                >
                    <div>
                        <span
                            className="text-[9px] block font-bold uppercase tracking-wider opacity-40"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Precio
                        </span>
                        <span className="text-sm font-black" style={{ color: 'var(--guor-gold)' }}>
                            {formatPrecio(producto.precio)}
                        </span>
                    </div>

                    {/* Botón de texto en el footer — solo en modo catálogo */}
                    {onSelect && (
                        <button
                            type="button"
                            onClick={() => onSelect(producto)}
                            className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                            style={{ color: 'var(--guor-dark)' }}
                        >
                            Nuevo Pedido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function ProductoCardSkeleton() {
    return (
        <div
            className="bg-white border rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
            style={{ borderColor: 'var(--guor-stone)' }}
        >
            <div className="aspect-square w-full" style={{ backgroundColor: 'var(--guor-cream)' }}>
                <div className="absolute top-3 right-3 h-5 w-16 bg-white/60 rounded-md" />
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="flex gap-1.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 rounded-full bg-gray-100" />
                    ))}
                </div>
                <div className="mt-auto pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--guor-stone)' }}>
                    <div className="h-5 w-20 bg-gray-100 rounded" />
                    <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
            </div>
        </div>
    );
}
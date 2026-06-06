'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, PackagePlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Zona } from './AlmacenZonasTab';

// ── Tipos alineados con ORDEN_COMPRA_INCLUDE y OrdenesProduccionService ────────
type TipoOrigen = 'ORDEN_COMPRA' | 'ORDEN_PRODUCCION';

interface OrdenCompraItem {
    id: number;
    cantidad_pedida: number;
    cantidad_recibida: number;
    materiales?: { id: number; nombre: string } | null;
    insumo?: { id: number; nombre: string } | null;
}

interface OrdenCompra {
    _tipo: 'compra';
    id: number;
    estado: string;
    proveedores: { razon_social: string };
    ordenes_compra_items: OrdenCompraItem[];
}

interface OrdenProduccion {
    _tipo: 'produccion';
    id: number;
    estado: string;
    productos: { id: number; nombre: string };
    cantidad_solicitada: number;
}

type OrdenDisponible = OrdenCompra | OrdenProduccion;

interface ItemParaAgregar {
    tipo: 'producto' | 'insumo' | 'material';
    tipo_id: number;
    nombre: string;
    cantidad: number;
}

interface AlmacenStockFormProps {
    almacenId: number;
    zonas: Zona[];
    onSuccess: () => void;
    onCancel: () => void;
}

const TIPO_CONFIG = {
    producto: { label: 'Producto', color: 'bg-blue-100 text-blue-700' },
    insumo: { label: 'Insumo', color: 'bg-violet-100 text-violet-700' },
    material: { label: 'Material', color: 'bg-amber-100 text-amber-700' },
} as const;

export function AlmacenStockForm({ almacenId, zonas, onSuccess, onCancel }: AlmacenStockFormProps) {
    const [tipoOrigen, setTipoOrigen] = useState<TipoOrigen>('ORDEN_COMPRA');
    const [ordenes, setOrdenes] = useState<OrdenDisponible[]>([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [ordenId, setOrdenId] = useState('');
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenDisponible | null>(null);
    const [zonaId, setZonaId] = useState('');
    const [stockMinimo, setStockMinimo] = useState('0');
    const [savingItemId, setSavingItemId] = useState<number | null>(null);
    const [agregados, setAgregados] = useState<Set<number>>(new Set());

    useEffect(() => {
        setOrdenId('');
        setOrdenSeleccionada(null);
        setOrdenes([]);
        setAgregados(new Set());

        const cargar = async () => {
            setLoadingOrdenes(true);
            try {
                const endpoint = tipoOrigen === 'ORDEN_COMPRA'
                    ? '/api/admin/ordenes-compra?estado=confirmada,parcialmente_recibida'
                    : '/api/admin/ordenes-produccion?estado=en_produccion,completada&limit=100';

                const res = await fetch(endpoint);
                if (!res.ok) throw new Error();
                const raw = await res.json();

                // ── Estructura diferente por endpoint ──────────────────────────
                const lista = tipoOrigen === 'ORDEN_COMPRA'
                    ? (raw.data ?? [])
                    : (raw.ordenes ?? []);

                const _tipo = tipoOrigen === 'ORDEN_COMPRA' ? 'compra' : 'produccion';
                setOrdenes(lista.map((o: OrdenCompra | OrdenProduccion) => ({ ...o, _tipo })));
            } catch {
                toast.error('Error al cargar órdenes');
            } finally {
                setLoadingOrdenes(false);
            }
        };

        cargar();
    }, [tipoOrigen]);

    const seleccionarOrden = (id: string) => {
        setOrdenId(id);
        setAgregados(new Set());
        setOrdenSeleccionada(ordenes.find(o => String(o.id) === id) ?? null);
    };

    // ── Extraer ítems según tipo de orden ─────────────────────────────────────
    const itemsDeOrden = (): ItemParaAgregar[] => {
        if (!ordenSeleccionada) return [];

        if (ordenSeleccionada._tipo === 'compra') {
            return ordenSeleccionada.ordenes_compra_items
                .map(i => {
                    // Prisma devuelve "materiales" y "insumo"
                    if (i.materiales) {
                        return {
                            tipo: 'material' as const,
                            tipo_id: i.materiales.id,
                            nombre: i.materiales.nombre,
                            cantidad: Number(i.cantidad_pedida) - Number(i.cantidad_recibida),
                        };
                    }
                    if (i.insumo) {
                        return {
                            tipo: 'insumo' as const,
                            tipo_id: i.insumo.id,
                            nombre: i.insumo.nombre,
                            cantidad: Number(i.cantidad_pedida) - Number(i.cantidad_recibida),
                        };
                    }
                    return null;
                })
                .filter((i): i is NonNullable<typeof i> => i !== null && i.cantidad > 0) as ItemParaAgregar[];
        }

        // Orden de producción → producto único
        return [{
            tipo: 'producto',
            tipo_id: ordenSeleccionada.productos.id,
            nombre: ordenSeleccionada.productos.nombre,
            cantidad: ordenSeleccionada.cantidad_solicitada,
        }];
    };

    const agregarItem = async (item: ItemParaAgregar) => {
        setSavingItemId(item.tipo_id);
        try {
            const body = {
                [`${item.tipo}_id`]: item.tipo_id,
                zona_id: zonaId || null,
                cantidad: item.cantidad,
                stock_minimo: parseFloat(stockMinimo) || 0,
            };

            const res = await fetch(`/api/admin/almacenes/${almacenId}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.status === 409)
                return toast.error(`Ya existe stock para "${item.nombre}" en esta zona`);
            if (!res.ok) throw new Error();

            toast.success(`"${item.nombre}" agregado al stock`);
            setAgregados(prev => new Set(prev).add(item.tipo_id));
        } catch {
            toast.error(`Error al agregar "${item.nombre}"`);
        } finally {
            setSavingItemId(null);
        }
    };

    const items = itemsDeOrden();
    const todosAgregados = items.length > 0 && items.every(i => agregados.has(i.tipo_id));

    const labelOrden = (o: OrdenDisponible) =>
        o._tipo === 'compra'
            ? `#${o.id} — ${(o as OrdenCompra).proveedores.razon_social} (${o.estado})`
            : `#${o.id} — ${(o as OrdenProduccion).productos.nombre} · ${(o as OrdenProduccion).cantidad_solicitada} uds (${o.estado})`;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Agregar stock desde orden</p>
                <button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <div className="space-y-4">

                {/* Tipo de origen */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Tipo de orden *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['ORDEN_COMPRA', 'ORDEN_PRODUCCION'] as TipoOrigen[]).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTipoOrigen(t)}
                                className={cn(
                                    'h-9 rounded-xl border text-xs font-semibold transition-all px-3',
                                    tipoOrigen === t
                                        ? 'bg-pink-50 border-pink-300 text-pink-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                )}
                            >
                                {t === 'ORDEN_COMPRA' ? 'Orden de compra' : 'Orden de producción'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selector de orden */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        {tipoOrigen === 'ORDEN_COMPRA' ? 'Orden de compra' : 'Orden de producción'} *
                    </label>
                    {loadingOrdenes ? (
                        <div className="flex items-center gap-2 h-10 px-3 border border-slate-200 rounded-xl bg-white">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Cargando órdenes...</span>
                        </div>
                    ) : ordenes.length === 0 ? (
                        <div className="flex items-center h-10 px-3 border border-amber-200 rounded-xl bg-amber-50">
                            <span className="text-xs text-amber-600 font-medium">No hay órdenes disponibles</span>
                        </div>
                    ) : (
                        <select
                            value={ordenId}
                            onChange={e => seleccionarOrden(e.target.value)}
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">Selecciona una orden...</option>
                            {ordenes.map(o => (
                                <option key={o.id} value={String(o.id)}>
                                    {labelOrden(o)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Zona y stock mínimo */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Zona
                        </label>
                        <select
                            value={zonaId}
                            onChange={e => setZonaId(e.target.value)}
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">Sin zona</option>
                            {zonas.map(z => (
                                <option key={z.id} value={String(z.id)}>{z.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Stock mínimo
                        </label>
                        <input
                            type="number"
                            min={0}
                            step="any"
                            value={stockMinimo}
                            onChange={e => setStockMinimo(e.target.value)}
                            placeholder="0"
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                </div>

                {/* Ítems de la orden */}
                {ordenSeleccionada && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Ítems de la orden
                        </label>

                        {items.length === 0 ? (
                            <div className="flex items-center h-10 px-3 border border-slate-200 rounded-xl bg-white">
                                <span className="text-xs text-slate-400">No hay ítems pendientes de recibir</span>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-100">
                                {items.map(item => {
                                    const yaAgregado = agregados.has(item.tipo_id);
                                    const guardando = savingItemId === item.tipo_id;

                                    return (
                                        <div
                                            key={`${item.tipo}-${item.tipo_id}`}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 transition-colors',
                                                yaAgregado && 'bg-emerald-50/50'
                                            )}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    'text-xs font-semibold truncate',
                                                    yaAgregado ? 'text-emerald-700' : 'text-slate-800'
                                                )}>
                                                    {item.nombre}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Cantidad estimada:{' '}
                                                    <span className="font-bold text-slate-600">
                                                        {Number(item.cantidad).toLocaleString()}
                                                    </span>
                                                </p>
                                            </div>

                                            <Badge className={cn('text-[9px] border-none flex-shrink-0', TIPO_CONFIG[item.tipo].color)}>
                                                {TIPO_CONFIG[item.tipo].label}
                                            </Badge>

                                            {yaAgregado ? (
                                                <div className="flex items-center gap-1 text-emerald-600 flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold">Agregado</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => agregarItem(item)}
                                                    disabled={guardando}
                                                    className="h-7 px-3 text-[11px] rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold flex-shrink-0"
                                                >
                                                    {guardando
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <><PackagePlus className="w-3 h-3 mr-1" />Agregar</>
                                                    }
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 justify-end pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="rounded-xl"
                    >
                        {todosAgregados ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {todosAgregados && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={onSuccess}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Listo
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { StockItem } from './AlmacenStockTab';

type DireccionMovimiento = 'entrada' | 'salida';
type TipoOrigen = 'ORDEN_COMPRA' | 'ORDEN_PRODUCCION' | 'PEDIDO_CLIENTE' | 'AJUSTE_MANUAL';

interface OrdenCompra {
    _tipo: 'compra';
    id: number;
    estado: string;
    proveedor: { razon_social: string };
    total_orden: number;
}

interface OrdenProduccion {
    _tipo: 'produccion';
    id: number;
    estado: string;
    productos: { nombre: string };
    cantidad_solicitada: number;
}

type OrdenDisponible = OrdenCompra | OrdenProduccion;

interface AlmacenMovimientoFormProps {
    almacenId: number;
    item: StockItem;
    onSuccess: () => void;
    onCancel: () => void;
}

const ORIGEN_CONFIG: Record<TipoOrigen, { label: string; direcciones: DireccionMovimiento[] }> = {
    ORDEN_COMPRA: { label: 'Orden de compra', direcciones: ['entrada'] },
    ORDEN_PRODUCCION: { label: 'Orden de producción', direcciones: ['entrada', 'salida'] },
    PEDIDO_CLIENTE: { label: 'Pedido de cliente', direcciones: ['salida'] },
    AJUSTE_MANUAL: { label: 'Ajuste manual', direcciones: ['entrada', 'salida'] },
};

export function AlmacenMovimientoForm({
    almacenId,
    item,
    onSuccess,
    onCancel,
}: AlmacenMovimientoFormProps) {
    const [direccion, setDireccion] = useState<DireccionMovimiento>('entrada');
    const [tipoOrigen, setTipoOrigen] = useState<TipoOrigen>('ORDEN_COMPRA');
    const [origenId, setOrigenId] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [motivo, setMotivo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [ordenes, setOrdenes] = useState<OrdenDisponible[]>([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [origenSeleccionado, setOrigenSeleccionado] = useState<OrdenDisponible | null>(null);

    useEffect(() => {
        setOrigenId('');
        setOrigenSeleccionado(null);
        setOrdenes([]);

        if (tipoOrigen === 'AJUSTE_MANUAL') return;

        const cargarOrdenes = async () => {
            setLoadingOrdenes(true);
            try {
                const endpoint =
                    tipoOrigen === 'ORDEN_COMPRA'
                        ? '/api/admin/ordenes-compra?estado=confirmada,parcialmente_recibida'
                        : tipoOrigen === 'ORDEN_PRODUCCION'
                            ? '/api/admin/ordenes-produccion?estado=en_produccion,completada'
                            : '/api/admin/pedidos?estado=pagado,en_produccion,listo_para_despacho';

                const res = await fetch(endpoint);
                if (!res.ok) throw new Error();

                const raw = await res.json();
                const _tipo = tipoOrigen === 'ORDEN_COMPRA' ? 'compra' : 'produccion';
                const data: OrdenDisponible[] = raw.map((o: OrdenCompra | OrdenProduccion) => ({
                    ...o,
                    _tipo,
                }));
                setOrdenes(data);
            } catch {
                toast.error('Error al cargar órdenes disponibles');
            } finally {
                setLoadingOrdenes(false);
            }
        };

        cargarOrdenes();
    }, [tipoOrigen]);

    useEffect(() => {
        const tiposCompatibles = Object.entries(ORIGEN_CONFIG)
            .filter(([, v]) => v.direcciones.includes(direccion))
            .map(([k]) => k as TipoOrigen);

        if (!tiposCompatibles.includes(tipoOrigen)) {
            setTipoOrigen(tiposCompatibles[0]);
        }
    }, [direccion]);

    const seleccionarOrden = (id: string) => {
        setOrigenId(id);
        const orden = ordenes.find((o: OrdenDisponible) => String(o.id) === id);
        setOrigenSeleccionado(orden ?? null);
    };

    const itemRelacionado = item.producto ?? item.insumo ?? item.material;
    const stockActual = Number(item.cantidad);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cantidad || parseFloat(cantidad) <= 0)
            return toast.error('La cantidad debe ser mayor a 0');

        if (tipoOrigen !== 'AJUSTE_MANUAL' && !origenId)
            return toast.error('Selecciona una orden de referencia');

        if (direccion === 'salida' && parseFloat(cantidad) > stockActual)
            return toast.error(`Stock insuficiente: disponible ${stockActual}`);

        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/almacenes/${almacenId}/stock/movimiento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock_id: item.id,
                    direccion,
                    tipo_origen: tipoOrigen,
                    referencia_id: origenId ? Number(origenId) : null,
                    cantidad: parseFloat(cantidad),
                    motivo: motivo || undefined,
                }),
            });

            if (res.status === 400) {
                const err = await res.json();
                return toast.error(err.message ?? 'Datos inválidos');
            }
            if (res.status === 409)
                return toast.error('Stock insuficiente según el servidor');
            if (!res.ok) throw new Error();

            toast.success(
                direccion === 'entrada'
                    ? 'Entrada registrada correctamente'
                    : 'Salida registrada correctamente'
            );
            onSuccess();
        } catch {
            toast.error('Error al registrar el movimiento');
        } finally {
            setIsSaving(false);
        }
    };

    const labelOrden =
        tipoOrigen === 'ORDEN_COMPRA' ? 'Orden de compra' :
            tipoOrigen === 'ORDEN_PRODUCCION' ? 'Orden de producción' :
                tipoOrigen === 'PEDIDO_CLIENTE' ? 'Pedido de cliente' : '';

    const renderOpcionOrden = (o: OrdenDisponible) => {
        if (o._tipo === 'compra') {
            return `#${o.id} — ${o.proveedor.razon_social} (${o.estado})`;
        }
        return `#${o.id} — ${o.productos.nombre} · ${o.cantidad_solicitada} uds (${o.estado})`;
    };

    const renderInfoOrden = (o: OrdenDisponible) => {
        if (o._tipo === 'compra') {
            return `Proveedor: ${o.proveedor.razon_social} · Total: S/ ${o.total_orden.toLocaleString()}`;
        }
        return `Producto: ${o.productos.nombre} · Cantidad solicitada: ${o.cantidad_solicitada}`;
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-slate-700">Registrar movimiento</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                        {itemRelacionado?.nombre ?? 'Ítem'} · Stock actual:{' '}
                        <span className="font-bold text-slate-600">{stockActual.toLocaleString()}</span>
                    </p>
                </div>
                <button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Dirección */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Tipo de movimiento *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['entrada', 'salida'] as DireccionMovimiento[]).map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDireccion(d)}
                                className={cn(
                                    'flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-semibold transition-all',
                                    direccion === d
                                        ? d === 'entrada'
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                            : 'bg-red-50 border-red-300 text-red-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                )}
                            >
                                {d === 'entrada'
                                    ? <ArrowDown className="w-4 h-4" />
                                    : <ArrowUp className="w-4 h-4" />
                                }
                                {d === 'entrada' ? 'Entrada' : 'Salida'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tipo de origen */}
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Origen del movimiento *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.entries(ORIGEN_CONFIG) as [TipoOrigen, typeof ORIGEN_CONFIG[TipoOrigen]][])
                            .filter(([, v]) => v.direcciones.includes(direccion))
                            .map(([key, val]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTipoOrigen(key)}
                                    className={cn(
                                        'h-9 rounded-xl border text-xs font-semibold transition-all px-3',
                                        tipoOrigen === key
                                            ? 'bg-pink-50 border-pink-300 text-pink-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    )}
                                >
                                    {val.label}
                                </button>
                            ))
                        }
                    </div>
                </div>

                {/* Selector de orden */}
                {tipoOrigen !== 'AJUSTE_MANUAL' && (
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            {labelOrden} *
                        </label>
                        {loadingOrdenes ? (
                            <div className="flex items-center gap-2 h-10 px-3 border border-slate-200 rounded-xl bg-white">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                <span className="text-xs text-slate-400">Cargando órdenes...</span>
                            </div>
                        ) : ordenes.length === 0 ? (
                            <div className="flex items-center h-10 px-3 border border-amber-200 rounded-xl bg-amber-50">
                                <span className="text-xs text-amber-600 font-medium">
                                    No hay órdenes disponibles con estado válido
                                </span>
                            </div>
                        ) : (
                            <select
                                value={origenId}
                                onChange={e => seleccionarOrden(e.target.value)}
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="">Selecciona una {labelOrden.toLowerCase()}...</option>
                                {ordenes.map((o: OrdenDisponible) => (
                                    <option key={o.id} value={String(o.id)}>
                                        {renderOpcionOrden(o)}
                                    </option>
                                ))}
                            </select>
                        )}

                        {origenSeleccionado && (
                            <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="text-xs text-blue-700 font-medium">
                                    {renderInfoOrden(origenSeleccionado)}
                                </span>
                                <Badge className="ml-auto text-[9px] bg-blue-100 text-blue-700 border-blue-200 font-bold uppercase">
                                    {origenSeleccionado.estado}
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                {/* Cantidad y motivo */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Cantidad *
                        </label>
                        <input
                            type="number"
                            min={0.01}
                            step="any"
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                            placeholder="0"
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        {direccion === 'salida' && cantidad && parseFloat(cantidad) > stockActual && (
                            <p className="text-[10px] text-red-500 font-medium mt-1">
                                Excede el stock disponible ({stockActual})
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Motivo
                        </label>
                        <input
                            type="text"
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Opcional..."
                            maxLength={200}
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 justify-end pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={
                            isSaving ||
                            !cantidad ||
                            parseFloat(cantidad) <= 0 ||
                            (tipoOrigen !== 'AJUSTE_MANUAL' && !origenId) ||
                            (direccion === 'salida' && parseFloat(cantidad) > stockActual)
                        }
                        className={cn(
                            'rounded-xl text-white px-5',
                            direccion === 'entrada'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-red-500 hover:bg-red-600'
                        )}
                    >
                        {isSaving
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Guardando...</>
                            : direccion === 'entrada' ? 'Registrar entrada' : 'Registrar salida'
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
}
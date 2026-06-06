'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Filter, Package2, Plus, Ban, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Zona } from './AlmacenZonasTab';
import { AlmacenStockForm } from './AlmacenStockForm';
import { AlmacenMovimientoForm } from './AlmacenMovimientoForm';

export interface StockItem {
    id: number;
    almacen_id: number;
    zona_id: number | null;
    producto_id: number | null;
    insumo_id: number | null;
    material_id: number | null;
    cantidad: string | number;
    stock_minimo: string | number | null;
    updated_at: string;
    tipo: 'producto' | 'insumo' | 'material';
    zona?: { id: number; nombre: string; activo: boolean } | null;
    producto?: { id: number; nombre: string; codigo?: string | null } | null;
    insumo?: { id: number; nombre: string; codigo?: string | null } | null;
    material?: { id: number; nombre: string; codigo?: string | null } | null;
}

interface StockResponse {
    data: StockItem[];
    total: number;
    page: number;
    limit: number;
}

interface AlmacenStockTabProps {
    almacenId: number;
    zonas: Zona[];
}

const TIPO_CONFIG = {
    producto: { label: 'Producto', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    insumo: { label: 'Insumo', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    material: { label: 'Material', color: 'bg-amber-100 text-amber-700 border-amber-200' },
} as const;

const LIMIT = 20;

export function AlmacenStockTab({ almacenId, zonas = [] }: AlmacenStockTabProps) {
    const [data, setData] = useState<StockItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [zonaFilter, setZonaFilter] = useState<string>('todas');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ cantidad: string; stock_minimo: string }>({ cantidad: '', stock_minimo: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [movimientoItem, setMovimientoItem] = useState<StockItem | null>(null);

    const loadStock = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
            });
            if (zonaFilter !== 'todas') params.set('zona', zonaFilter);

            const res = await fetch(`/api/admin/almacenes/${almacenId}/stock?${params}`);
            if (!res.ok) throw new Error();
            const json: StockResponse = await res.json();
            setData(json.data);
            setTotal(json.total);
        } catch {
            toast.error('Error al cargar el stock');
        } finally {
            setLoading(false);
        }
    }, [almacenId, page, zonaFilter]);

    useEffect(() => { loadStock(); }, [loadStock]);

    const startEdit = (item: StockItem) => {
        setEditingId(item.id);
        setEditValues({
            cantidad: String(item.cantidad),
            stock_minimo: String(item.stock_minimo ?? ''),
        });
    };

    const saveEdit = async (item: StockItem) => {
        if (isNaN(parseFloat(editValues.cantidad)) || parseFloat(editValues.cantidad) < 0) {
            toast.error('La cantidad no puede ser un valor negativo');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/almacenes/${almacenId}/stock/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cantidad: parseFloat(editValues.cantidad) || 0,
                    stock_minimo: editValues.stock_minimo ? parseFloat(editValues.stock_minimo) : null,
                }),
            });
            if (!res.ok) throw new Error();
            toast.success('Stock actualizado correctamente');
            setEditingId(null);
            loadStock();
        } catch {
            toast.error('Error al actualizar el stock');
        } finally {
            setIsSaving(false);
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    const lowStockCount = data.filter(
        i => i.stock_minimo !== null && Number(i.cantidad) < Number(i.stock_minimo)
    ).length;

    return (
        <div className="space-y-4 relative"> {/* relative ayuda al posicionamiento de la vista */}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    {lowStockCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700">
                                {lowStockCount} bajo mínimo en esta lista
                            </span>
                        </div>
                    )}
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                        {total} {total === 1 ? 'item registrado' : 'items registrados'}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Filtro de Zonas */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <Filter className="w-3.5 h-3.5 text-gray-400" />
                        <select
                            value={zonaFilter}
                            onChange={e => { setZonaFilter(e.target.value); setPage(1); }}
                            className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                        >
                            <option value="todas">Todas las zonas</option>
                            {zonas.map(z => (
                                <option key={z.id} value={String(z.id)}>
                                    {z.nombre} {!z.activo ? '(Inactiva)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadStock}
                        disabled={loading}
                        className="h-9 w-9 p-0 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-slate-50"
                        title="Actualizar tabla"
                    >
                        <RefreshCw className={cn('w-3.5 h-3.5 text-gray-500', loading && 'animate-spin')} />
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => setShowAddForm(v => !v)}
                        className="rounded-xl h-9 bg-pink-600 hover:bg-pink-700 text-white gap-1.5 font-semibold"
                    >
                        <Plus className="w-3.5 h-3.5" /> Agregar stock
                    </Button>
                </div>
            </div>

            {/* Formulario de Entrada */}
            {showAddForm && (
                <AlmacenStockForm
                    almacenId={almacenId}
                    zonas={zonas}
                    onSuccess={() => { setShowAddForm(false); loadStock(); }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* CONTENEDOR PRINCIPAL: Divide la pantalla si el formulario de movimiento está abierto */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* Tabla de Resultados */}
                <div className={cn("bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm w-full transition-all", movimientoItem && "lg:w-2/3")}>
                    {loading ? (
                        <div className="divide-y divide-gray-100 animate-pulse">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-50/50" />)}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Package2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Sin stock registrado</p>
                            {zonaFilter !== 'todas' && (
                                <p className="text-xs mt-1 text-slate-400/80">Prueba seleccionando otra zona o añade un elemento.</p>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4 pl-5">Código / Item</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Tipo</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4">Zona asignada</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4 text-right">Cantidad</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4 text-right">Mínimo</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4 text-center">Estado</TableHead>
                                    <TableHead className="font-bold text-gray-400 uppercase text-[10px] tracking-widest py-4 text-right pr-5">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map(item => {
                                    const isLow = item.stock_minimo !== null && Number(item.cantidad) < Number(item.stock_minimo);
                                    const isEditing = editingId === item.id;
                                    const isMovingThis = movimientoItem?.id === item.id;
                                    const tipoConfig = TIPO_CONFIG[item.tipo];
                                    const isZonaInactiva = item.zona && item.zona.activo === false;

                                    const itemRelacionado = item.producto ?? item.insumo ?? item.material;
                                    const itemName = itemRelacionado?.nombre ?? 'Ítem no identificado';
                                    const itemCodigo = itemRelacionado?.codigo ?? `ID: ${item.producto_id ?? item.insumo_id ?? item.material_id}`;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className={cn(
                                                'group transition-colors',
                                                isLow ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/50',
                                                isZonaInactiva && 'bg-slate-50/50 opacity-80',
                                                isMovingThis && 'bg-pink-50/30 hover:bg-pink-50/40 border-l-4 border-l-pink-500'
                                            )}
                                        >
                                            {/* Item e Identificador */}
                                            <TableCell className="font-medium pl-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{itemName}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{itemCodigo}</span>
                                                </div>
                                            </TableCell>

                                            {/* Badge de tipo */}
                                            <TableCell>
                                                <Badge variant="outline" className={cn('rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider', tipoConfig.color)}>
                                                    {tipoConfig.label}
                                                </Badge>
                                            </TableCell>

                                            {/* Nombre de la Zona */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn("text-xs font-medium", isZonaInactiva ? "text-slate-400 line-through" : "text-slate-600")}>
                                                        {item.zona?.nombre ?? 'Sin Zona'}
                                                    </span>
                                                    {isZonaInactiva && (
                                                        <Badge className="bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase tracking-tight py-0 px-1 border-none">
                                                            <Ban className="w-2 h-2 mr-0.5 inline" /> Inactiva
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Cantidad Actual */}
                                            <TableCell className="text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValues.cantidad}
                                                        onChange={e => setEditValues(v => ({ ...v, cantidad: e.target.value }))}
                                                        className="w-24 text-right text-xs font-bold border border-pink-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                                                        min={0}
                                                        step="any"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className={cn('text-xs font-black', isLow ? 'text-amber-600' : 'text-slate-900')}>
                                                        {Number(item.cantidad).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Umbral Mínimo */}
                                            <TableCell className="text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValues.stock_minimo}
                                                        onChange={e => setEditValues(v => ({ ...v, stock_minimo: e.target.value }))}
                                                        className="w-24 text-right text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                                                        min={0}
                                                        step="any"
                                                        placeholder="Sin mínimo"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {item.stock_minimo != null ? Number(item.stock_minimo).toLocaleString() : '—'}
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Estado Semáforo */}
                                            <TableCell className="text-center">
                                                {isLow ? (
                                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 mx-auto">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> MÍNIMO
                                                    </span>
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 block mx-auto shadow-sm" title="Stock saludable" />
                                                )}
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell className="text-right pr-5">
                                                {isEditing ? (
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="rounded-xl h-7 px-2.5 text-[11px] font-medium" disabled={isSaving}>
                                                            Cancelar
                                                        </Button>
                                                        <Button size="sm" onClick={() => saveEdit(item)} className="rounded-xl h-7 px-3 text-[11px] bg-pink-600 hover:bg-pink-700 text-white font-bold" disabled={isSaving}>
                                                            OK
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            onClick={() => startEdit(item)}
                                                            className="rounded-xl h-7 px-3 text-[11px] font-semibold hover:bg-pink-50 hover:text-pink-600 md:opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-pink-100"
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setMovimientoItem(item)}
                                                            className={cn(
                                                                "rounded-xl h-7 px-3 text-[11px] font-semibold hover:bg-emerald-50 hover:text-emerald-600 md:opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-emerald-100",
                                                                isMovingThis && "md:opacity-100 text-emerald-600 bg-emerald-50 border-emerald-100"
                                                            )}
                                                        >
                                                            Mover
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* VISTA LATERAL DEL FORMULARIO DE MOVIMIENTOS */}
                {movimientoItem && (
                    <div className="w-full lg:w-1/3 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden sticky top-4 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Registrar Movimiento</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {movimientoItem.producto?.nombre ?? movimientoItem.insumo?.nombre ?? movimientoItem.material?.nombre}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMovimientoItem(null)}
                                className="h-7 w-7 p-0 rounded-full hover:bg-slate-200"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </Button>
                        </div>
                        <div className="p-4">
                            <AlmacenMovimientoForm
                                almacenId={almacenId}
                                item={movimientoItem}
                                onSuccess={() => { setMovimientoItem(null); loadStock(); }}
                                onCancel={() => setMovimientoItem(null)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Paginador */}
            {totalPages > 1 && (
                <div className={cn("flex items-center justify-between px-1 pt-1 w-full", movimientoItem && "lg:w-2/3")}>
                    <span className="text-xs text-slate-400 font-medium">
                        Página {page} de {totalPages} <span className="mx-1">•</span> Mostrando {data.length} de {total} ítems
                    </span>
                    <div className="flex gap-1.5">
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-xl h-8 px-3 text-xs bg-white border-slate-200 shadow-sm font-semibold"
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-xl h-8 px-3 text-xs bg-white border-slate-200 shadow-sm font-semibold"
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
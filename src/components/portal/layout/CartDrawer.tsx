'use client';

import { X, Trash2, ArrowRight, CreditCard, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/hooks/usePortal';
import { type ItemCarrito } from '@/components/portal/_contexts/PortalContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const { itemsCarrito, eliminarDelCarrito, resumenCarrito } = usePortal();

    if (!isOpen) return null;

    // Tipado corregido y semántico para el flujo de pedidos
    const subtotal = itemsCarrito?.reduce((acc, item: ItemCarrito) => acc + ((item.precio_unitario || 0) * (item.cantidad || 0)), 0) || 0;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Encabezado */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-amber-600" />
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                            Resumen del Pedido ({itemsCarrito?.length || 0} SKUs)
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Listado de ítems */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {itemsCarrito && itemsCarrito.length > 0 ? (
                        itemsCarrito.map((item: ItemCarrito) => (
                            <div key={item.variante_id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl relative group transition-all hover:border-slate-200">
                                <div className="w-14 h-14 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.imagen ? (
                                        <img src={item.imagen.startsWith('http') ? item.imagen : `https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/${item.imagen}`} alt={item.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-300">N/A</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 truncate">{item.nombre}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Talla: {item.talla} | Color: {item.color}</p>
                                    <p className="text-[10px] text-slate-400">Cant: <span className="font-semibold text-slate-700">{item.cantidad} uds</span></p>
                                    <p className="text-xs font-black text-slate-900 mt-1">{formatCurrency(item.subtotal)}</p>
                                </div>

                                <button
                                    onClick={() => eliminarDelCarrito?.(item.variante_id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors absolute right-2 top-2 sm:opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <ShoppingBag size={32} className="opacity-30 text-amber-600" />
                            <p className="text-xs font-medium">No hay productos en tu carrito de compras</p>
                        </div>
                    )}
                </div>

                {/* Footer del Pedido */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
                    <div className="space-y-1.5 text-xs font-medium text-slate-500 border-b border-slate-200 pb-3">
                        <div className="flex justify-between">
                            <span>Subtotal Bruto</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {(resumenCarrito?.descuento_monto ?? 0) > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-1 rounded">
                                <span>Descuento ({resumenCarrito.descripcion_descuento})</span>
                                <span>-{formatCurrency(resumenCarrito.descuento_monto)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>IGV (18%)</span>
                            <span>{formatCurrency(resumenCarrito?.igv || 0)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total a Pagar</span>
                        <span className="text-lg font-black text-slate-900">{formatCurrency(resumenCarrito?.total || subtotal)}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button
                            onClick={() => { onClose(); router.push('/portal/catalogo'); }}
                            disabled={!itemsCarrito || itemsCarrito.length === 0}
                            className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continuar con su pedido
                            <ArrowRight size={14} />
                        </button>

                        <button
                            onClick={() => { onClose(); router.push('/portal/carrito/checkout'); }}
                            disabled={!itemsCarrito || itemsCarrito.length === 0}
                            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CreditCard size={14} />
                            Ir a Pagar
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
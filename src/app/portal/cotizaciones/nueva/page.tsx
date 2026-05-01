'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Info, Package, Trash2 } from 'lucide-react';
import { usePortal, MOQ_MINIMO } from '../../_contexts/PortalContext';
import { useProductosPortal } from '@/lib/hooks/useProductosPortal';
import { CotizadorPanel } from '@/components/portal/CotizacionPanel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TALLAS_ORDEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34'];

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const { 
    cliente, 
    items, 
    resumen, 
    agregarAlBorrador, 
    limpiarBorrador,
    eliminarDelBorrador 
  } = usePortal();

  // Búsqueda y Filtros
  const [busqueda, setBusqueda] = useState('');
  const [tallaFiltro, setTallaFiltro] = useState('');
  const { productos, loading: buscando } = useProductosPortal({ 
    busqueda, 
    talla: tallaFiltro 
  });

  // Estado local para la selección antes de confirmar al carrito
  const [seleccion, setSeleccion] = useState<Record<number, {
    talla: string; color: string; cantidad: number;
  }>>({});

  const [isPending, startTransition] = useTransition();

  // ── Helpers de Selección ──────────────────────────────────────────
  const getSeleccion = (productoId: number) => seleccion[productoId] ?? {
    talla: '', color: '', cantidad: MOQ_MINIMO,
  };

  const updateSeleccion = (productoId: number, patch: Partial<typeof seleccion[number]>) => {
    setSeleccion(prev => ({
      ...prev,
      [productoId]: { ...getSeleccion(productoId), ...patch },
    }));
  };

  const handleAgregar = (producto: any) => {
    const sel = getSeleccion(producto.id);
    
    if (!sel.talla || !sel.color) {
      toast.error('Selecciona talla y color antes de agregar');
      return;
    }

    const variante = producto.variantes?.find(
      (v: any) => v.talla === sel.talla && v.color === sel.color
    );

    // Estructura compatible con agregarAlBorrador del Context
    agregarAlBorrador({
      producto_id: producto.id,
      variante_id: variante?.id,
      nombre: producto.nombre,
      sku: producto.sku,
      imagen: producto.imagen,
      precio_unitario: producto.precio,
      cantidad: sel.cantidad,
      talla: sel.talla,
      color: sel.color,
      stock_disponible: variante?.stock ?? 0,
    });

    toast.success(`${producto.nombre} añadido`);
  };

  // ── Guardado Final ────────────────────────────────────────────────
  const handleEnviar = async (accion: 'borrador' | 'enviar') => {
    if (!items.length) return;
    if (!cliente) return toast.error("Error: Cliente no identificado");

    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: cliente.id,
            estado: accion === 'borrador' ? 'borrador' : 'enviada',
            // Datos del resumen calculados en el Context
            subtotal: resumen.subtotal,
            descuento_monto: resumen.descuento_monto,
            total: resumen.total,
            items: items.map(i => ({
              producto_id: i.producto_id,
              variante_id: i.variante_id,
              precio_snapshot: i.precio_unitario,
              cantidad: i.cantidad,
              talla: i.talla,
              color: i.color,
              subtotal: i.subtotal,
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al procesar');

        limpiarBorrador();
        toast.success(accion === 'borrador' ? 'Borrador guardado' : 'Cotización enviada con éxito');
        router.push(`/portal/cotizaciones/${data.id}`);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      {/* Topbar Dinámica */}
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Nueva Cotización</h1>
          {items.length > 0 && (
            <div className="flex gap-3 mt-0.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Package size={12} /> {resumen.total_modelos} modelos
              </span>
              <span>• {resumen.total_unidades.toLocaleString()} prendas</span>
              {resumen.descuento_pct > 0 && (
                <span className="text-emerald-600 font-medium">
                  {resumen.descuento_pct}% OFF aplicado
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEnviar('borrador')}
            disabled={!items.length || isPending}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => handleEnviar('enviar')}
            disabled={!items.length || isPending}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-40"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            Enviar Cotización
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Panel Central: Catálogo */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Buscador y Filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o SKU..."
                  className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <select
                value={tallaFiltro}
                onChange={e => setTallaFiltro(e.target.value)}
                className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
              >
                <option value="">Tallas: Todas</option>
                {TALLAS_ORDEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Lista de Productos */}
            {buscando ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={24} className="animate-spin mb-2" />
                <p className="text-sm">Cargando catálogo...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {productos.map((producto: any) => {
                  const sel = getSeleccion(producto.id);
                  const enCarrito = items.filter(i => i.producto_id === producto.id);
                  
                  // Agrupar variantes disponibles
                  const tallas = [...new Set<string>(producto.variantes?.map((v: any) => v.talla))];
                  const colores = sel.talla 
                    ? [...new Set<string>(producto.variantes?.filter((v: any) => v.talla === sel.talla).map((v: any) => v.color))]
                    : [];

                  return (
                    <div 
                      key={producto.id}
                      className={cn(
                        "group bg-white border rounded-xl p-4 transition-all hover:shadow-md",
                        enCarrito.length > 0 ? "border-blue-100 bg-blue-50/20" : "border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                          {producto.imagen && <img src={producto.imagen} alt="" className="w-full h-full object-cover" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{producto.nombre}</h3>
                          <p className="text-xs text-slate-500 font-mono">{producto.sku}</p>
                          <p className="mt-1 text-sm font-bold text-blue-600">S/ {producto.precio.toFixed(2)}</p>
                        </div>

                        {/* Selectores */}
                        <div className="flex items-center gap-2">
                          <select
                            value={sel.talla}
                            onChange={e => updateSeleccion(producto.id, { talla: e.target.value, color: '' })}
                            className="h-9 px-2 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="">Talla</option>
                            {tallas.sort((a,b) => TALLAS_ORDEN.indexOf(a) - TALLAS_ORDEN.indexOf(b)).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          <select
                            value={sel.color}
                            disabled={!sel.talla}
                            onChange={e => updateSeleccion(producto.id, { color: e.target.value })}
                            className="h-9 px-2 text-xs border border-slate-200 rounded-lg bg-white disabled:bg-slate-50"
                          >
                            <option value="">Color</option>
                            {colores.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>

                          <div className="flex flex-col">
                            <input
                              type="number"
                              value={sel.cantidad}
                              min={MOQ_MINIMO}
                              onChange={e => updateSeleccion(producto.id, { cantidad: parseInt(e.target.value) || 0 })}
                              className={cn(
                                "w-24 h-9 text-center text-xs border rounded-lg outline-none",
                                sel.cantidad < MOQ_MINIMO ? "border-amber-400 bg-amber-50" : "border-slate-200"
                              )}
                            />
                          </div>

                          <button
                            onClick={() => handleAgregar(producto)}
                            className="px-4 h-9 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>

                      {/* Chips de variantes ya agregadas de este producto */}
                      {enCarrito.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-slate-200">
                          {enCarrito.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-blue-100/50 text-[10px] text-blue-700 rounded-md font-medium">
                              {item.talla} | {item.color} | {item.cantidad} uds
                              <button 
                                onClick={() => eliminarDelBorrador(item.variante_id)}
                                className="hover:text-red-600"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Resumen Financiero */}
        <aside className="w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto shadow-xl">
          <CotizadorPanel onEnviar={() => handleEnviar('enviar')} isSending={isPending} />
          
          {/* Info Adicional del Negocio */}
          <div className="p-4 mt-auto">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex gap-2 text-amber-800 mb-2">
                <Info size={16} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Regla de Descuento</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                El descuento se basa en el número de <strong>modelos distintos</strong>. 
                Actualmente tienes <span className="font-bold underline">{resumen.total_modelos} modelos</span>.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
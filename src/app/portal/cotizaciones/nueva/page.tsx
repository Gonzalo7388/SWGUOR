'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter }        from 'next/navigation';
import { Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { usePortal, MOQ_MINIMO } from '../../_contexts/PortalContext';
import { useProductosPortal }    from '@/lib/hooks/useProductosPortal';
import { CotizadorPanel }        from '@/components/portal/CotizacionPanel';
import { cn }                    from '@/lib/utils';
import { toast }                 from 'sonner';

const TALLAS_ORDEN = ['XS','S','M','L','XL','XXL','28','30','32','34'];

export default function NuevaCotizacionPage() {
  const router  = useRouter();
  const { cliente, items, resumen, agregarItem, limpiarCotizacion } = usePortal();

  // Búsqueda de productos
  const [busqueda,      setBusqueda]      = useState('');
  const [categoriaId,   setCategoriaId]   = useState<number | undefined>();
  const [tallaFiltro,   setTallaFiltro]   = useState('');
  const { productos, loading: buscando }  = useProductosPortal({ busqueda, categoriaId, talla: tallaFiltro });

  // Estado por producto (talla/color/cantidad elegidos antes de agregar)
  const [seleccion, setSeleccion] = useState<Record<number, {
    variante_id: number; talla: string; color: string; cantidad: number;
  }>>({});

  const [isPending, startTransition] = useTransition();

  // ── Helpers ──────────────────────────────────────────────────────
  const getSeleccion = (productoId: number) => seleccion[productoId] ?? {
    variante_id: 0, talla: '', color: '', cantidad: MOQ_MINIMO,
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
    if (sel.cantidad < MOQ_MINIMO) {
      toast.error(`Mínimo ${MOQ_MINIMO} unidades por modelo`);
      return;
    }
    const variante = producto.variantes?.find(
      (v: any) => v.talla === sel.talla && v.color === sel.color
    );
    agregarItem({
      producto_id:     producto.id,
      variante_id:     variante?.id ?? sel.variante_id,
      nombre:          producto.nombre,
      sku:             producto.sku,
      imagen:          producto.imagen ?? null,
      precio_unitario: producto.precio,
      cantidad:        sel.cantidad,
      talla:           sel.talla,
      color:           sel.color,
      stock_disponible: variante?.stock ?? 9999,
    });
    toast.success(`${producto.nombre} agregado a la cotización`);
  };

  // ── Enviar cotización ─────────────────────────────────────────────
  const handleEnviar = async (accion: 'borrador' | 'enviar') => {
    if (!items.length) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: cliente!.id,
            estado:     accion === 'borrador' ? 'borrador' : 'enviada',
            items: items.map(i => ({
              producto_id:     i.producto_id,
              variante_id:     i.variante_id,
              precio_snapshot: i.precio_unitario,
              cantidad:        i.cantidad,
              talla:           i.talla,
              color:           i.color,
              subtotal:        i.subtotal,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          // Errores de MOQ o stock insuficiente vienen estructurados del backend
          if (err.error === 'moq_insuficiente') {
            toast.error(`MOQ incumplido: ${err.detalle.join(', ')}`);
            return;
          }
          if (err.error === 'stock_insuficiente') {
            toast.error('Stock insuficiente para alguno de los productos');
            return;
          }
          throw new Error(err.error);
        }

        const { id } = await res.json();
        limpiarCotizacion();
        toast.success(accion === 'borrador' ? 'Borrador guardado' : 'Cotización enviada a GUOR');
        router.push(`/portal/cotizaciones/${id}`);
      } catch (e: any) {
        toast.error(e.message ?? 'Error al guardar la cotización');
      }
    });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0">
        <h1 className="text-sm font-medium text-slate-900">
          Nueva cotización
          {items.length > 0 && (
            <span className="ml-2 text-slate-400 font-normal">
              — {items.length} modelo{items.length > 1 ? 's' : ''} · {resumen.total_unidades.toLocaleString()} uds
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEnviar('borrador')}
            disabled={!items.length || isPending}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => handleEnviar('enviar')}
            disabled={!items.length || isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Enviar cotización
          </button>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo — búsqueda y resultados */}
        <div className="flex-1 overflow-auto p-5">
          {/* Controles de búsqueda */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, SKU o descripción…"
                className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-md text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <select
              value={tallaFiltro}
              onChange={e => setTallaFiltro(e.target.value)}
              className="h-9 border border-slate-200 rounded-md text-sm px-3 bg-white text-slate-700 focus:outline-none focus:border-blue-400"
            >
              <option value="">Todas las tallas</option>
              {TALLAS_ORDEN.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Resultados */}
          {buscando ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Buscando productos…</span>
            </div>
          ) : productos.length === 0 && busqueda ? (
            <p className="text-sm text-slate-400 text-center py-16">
              Sin resultados para &ldquo;{busqueda}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {/* Encabezado de tabla */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2 text-[11px] font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <span>Producto</span>
                <span>Precio unit.</span>
                <span>Talla</span>
                <span>Color</span>
                <span>Cantidad</span>
                <span></span>
              </div>

              {productos.map((producto: any) => {
                const sel     = getSeleccion(producto.id);
                const enLista = items.some(i => i.producto_id === producto.id && i.talla === sel.talla && i.color === sel.color);
                const tallasDisp = [...new Set<string>((producto.variantes ?? []).map((v: any) => v.talla))];
                const coloresDisp = sel.talla
                  ? [...new Set<string>((producto.variantes ?? []).filter((v: any) => v.talla === sel.talla).map((v: any) => v.color))]
                  : [...new Set<string>((producto.variantes ?? []).map((v: any) => v.color))];

                return (
                  <div
                    key={producto.id}
                    className={cn(
                      'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-white border rounded-md items-center text-sm',
                      enLista ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200',
                    )}
                  >
                    {/* Producto */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 rounded shrink-0 overflow-hidden">
                        {producto.imagen && (
                          <img src={producto.imagen} alt={producto.nombre}
                            className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{producto.nombre}</p>
                        <p className="text-xs text-slate-400">{producto.sku}</p>
                      </div>
                    </div>

                    {/* Precio */}
                    <p className="font-medium text-slate-900">
                      S/ {producto.precio.toFixed(2)}
                    </p>

                    {/* Talla */}
                    <select
                      value={sel.talla}
                      onChange={e => updateSeleccion(producto.id, { talla: e.target.value, color: '' })}
                      className="h-8 text-xs border border-slate-200 rounded px-2 bg-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Talla</option>
                      {tallasDisp.sort((a, b) => TALLAS_ORDEN.indexOf(a) - TALLAS_ORDEN.indexOf(b))
                        .map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {/* Color */}
                    <select
                      value={sel.color}
                      onChange={e => updateSeleccion(producto.id, { color: e.target.value })}
                      disabled={!sel.talla}
                      className="h-8 text-xs border border-slate-200 rounded px-2 bg-white focus:outline-none focus:border-blue-400 disabled:opacity-50"
                    >
                      <option value="">Color</option>
                      {coloresDisp.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Cantidad */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={sel.cantidad}
                        min={MOQ_MINIMO}
                        step={100}
                        onChange={e => updateSeleccion(producto.id, { cantidad: parseInt(e.target.value) || MOQ_MINIMO })}
                        className={cn(
                          'w-20 h-8 text-xs border rounded px-2 text-center focus:outline-none',
                          sel.cantidad < MOQ_MINIMO
                            ? 'border-amber-300 bg-amber-50 focus:border-amber-400'
                            : 'border-slate-200 focus:border-blue-400',
                        )}
                      />
                    </div>

                    {/* Botón agregar */}
                    <button
                      onClick={() => handleAgregar(producto)}
                      className={cn(
                        'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                        enLista
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700',
                      )}
                    >
                      {enLista ? '✓ Agregado' : 'Agregar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel derecho — cotizador */}
        <div className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-auto">
          <CotizadorPanel onEnviar={handleEnviar} isSending={isPending} />
        </div>
      </div>
    </div>
  );
}
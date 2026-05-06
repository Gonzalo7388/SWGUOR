'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter }        from 'next/navigation';
import { Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { usePortal, MOQ_MINIMO } from '../../_contexts/PortalContext';
import { useProductosPortal }    from '@/lib/hooks/useProductosPortal';
import { CotizadorPanel }        from '@/components/portal/CotizacionPanel';
import { cn }                    from '@/lib/utils';
import { toast }                 from 'sonner';
import { Producto } from '../../../../components/portal/ProductoCard';


const TALLAS_ORDEN = ['XS','S','M','L','XL','XXL','28','30','32','34'];

type Variante = {
  id: number;
  color: string;
  talla: string;
  stock: number;
};

export default function NuevaCotizacionPage() {
  const router  = useRouter();
  const { cliente, items, resumen, agregarAlBorrador, limpiarBorrador } = usePortal();

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

  // Modal
  const [itemDetalle, setItemDetalle] = useState<any>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');

  // ── ABRIR MODAL ─────────────────────────────────────────
  const handleVerDetalles = (item: any) => {
    setItemDetalle(item);

    const variantes: Variante[] = item.variantes ?? [];

    const colores = [...new Set(variantes.map(v => v.color))];
    const colorInicial = colores[0] ?? '';

    const tallas = variantes
      .filter(v => v.color === colorInicial)
      .map(v => v.talla);

    setColorSeleccionado(colorInicial);
    setTallaSeleccionada(tallas[0] ?? '');
  };

  // ── DERIVADOS ───────────────────────────────────────────
  const variantes: Variante[] = itemDetalle?.variantes ?? [];

  const coloresDisponibles: string[] = [
    ...new Set(variantes.map(v => v.color))
  ];

  const tallasDisponibles: string[] = variantes
    .filter(v => v.color === colorSeleccionado)
    .map(v => v.talla)
    .filter((t, i, arr) => arr.indexOf(t) === i);

    // ── AGREGAR DESDE MODAL ────────────────────────────────
  const handleAgregarDesdeModal = () => {
    if (!itemDetalle) return;

    if (!colorSeleccionado || !tallaSeleccionada) {
      toast.error('Selecciona color y talla');
      return;
    }

    const variante = variantes.find(
      v => v.color === colorSeleccionado && v.talla === tallaSeleccionada
    );

    agregarAlBorrador({
      id: itemDetalle.producto_id,
      nombre: itemDetalle.nombre,
      sku: itemDetalle.sku,
      imagen: itemDetalle.imagen,
      precio: itemDetalle.precio_unitario,
      cantidad: itemDetalle.cantidad,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
      variante_id: variante?.id,
      variantes: variantes
    });

    toast.success('Producto actualizado');
    setItemDetalle(null);
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
        limpiarBorrador();

        toast.success(
          accion === 'borrador'
            ? 'Borrador guardado'
            : 'Cotización enviada a GUOR'
        );

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

      {/*Layout de dos columnas*/}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel izquierdo — búsqueda y resultados */}
        <div className="flex-1 overflow-auto p-5">

    {/* Controles de búsqueda */}
    <div className="flex gap-3 mb-4">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre"
          className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-md text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      <select
        value={tallaFiltro}
        onChange={e => setTallaFiltro(e.target.value)}
        className="h-9 border border-slate-200 rounded-md text-sm px-3 bg-white text-slate-700 focus:outline-none focus:border-blue-400"
      >
        <option value="">Todas las tallas</option>
        {TALLAS_ORDEN.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>

    {items.length === 0 ? (
      <p className="text-sm text-slate-400 text-center py-16">
        Aún no hay productos en la cotización
      </p>
    ) : (
      <div className="space-y-2">

        {/* Listado de productos agregados a la cotización */}
        {items.map((item: any) => (
          <div
            key={`${item.producto_id}-${item.talla}-${item.color}`}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-white border rounded-md items-center text-sm"
          >
            {/* Producto */}
            {/* Imagen */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden">
                {item.imagen && (
                  <img src={item.imagen} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{item.nombre}</p>
                <p className="text-xs text-slate-400">{item.sku}</p>
              </div>
            </div>

            <p className="font-medium text-slate-900">
              S/ {Number(item.precio_unitario).toFixed(2)}
            </p>


          {/* boton detalles producto*/}  
        <button
               onClick={() => handleVerDetalles(item)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
               Ver detalles
        </button>


           </div>
        ))}

      </div>
     )}

      </div>
      {itemDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md p-6 max-w-md w-full">

            {/* Titulo */}
            <div className="px-5 py-3 border-b bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-700">
                Detalles de la Prenda
              </h2>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Información del producto */}
              <table className="w-full text-xs border border-slate-200 rounded-md overflow-hidden">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Característica</th>
                    <th className="text-left px-3 py-2 font-medium">Especificación</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-t">
                    <td className="px-3 py-2">Nombre</td>
                    <td className="px-3 py-2">{itemDetalle.nombre}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Precio Unitario</td>
                    <td className="px-3 py-2">
                      S/ {Number(itemDetalle.precio_unitario).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Selección de talla */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Talla
                </label>
                <select
                  value={tallaSeleccionada}
                  onChange={e => setTallaSeleccionada(e.target.value)}
                >
                  {tallasDisponibles.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>  

              {/* Selección de color */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Color
                </label>
                <select
                  value={colorSeleccionado}
                  onChange={e => {
                    const color = e.target.value;
                    setColorSeleccionado(color);

                    const tallas = variantes
                      .filter(v => v.color === color)
                      .map(v => v.talla);

                    setTallaSeleccionada(tallas[0] ?? '');
                  }}
                >
                  {coloresDisponibles.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>                   

              {/* Botones */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleAgregarDesdeModal}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm font-medium">
                  Guardar
                </button>

                <button
                  onClick={() => setItemDetalle(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm font-medium"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Panel derecho — cotizador */}
      <div className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-auto">
        <CotizadorPanel onEnviar={handleEnviar} isSending={isPending} />
      </div>

      </div>
    </div>
  );
}
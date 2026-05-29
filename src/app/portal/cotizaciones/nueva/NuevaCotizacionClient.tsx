'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  DollarSign,
  FileText,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { crearSolicitudCotizacion } from '@/app/portal/cotizaciones/actions';
import type { CategoriaCotizar, ItemCotizacionLocal, ProductoParaCotizar } from './types';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';

const BRAND = { ocre: '#c4a35a', ocreDark: '#9a6e3a' };
const TODAS_CATEGORIAS = 'todas';

type Props = {
  productos: ProductoParaCotizar[];
  categorias: CategoriaCotizar[];
};

export function NuevaCotizacionClient({ productos, categorias }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [itemsCotizacion, setItemsCotizacion] = useState<ItemCotizacionLocal[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS_CATEGORIAS);
  const [mensaje, setMensaje] = useState('');
  const [preciosPropuestos, setPreciosPropuestos] = useState<Record<number, string>>({});
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoParaCotizar | null>(null);
  const [varianteId, setVarianteId] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const matchCat = categoriaFiltro === TODAS_CATEGORIAS || String(p.categoria?.id) === categoriaFiltro;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.variantes.some((v) => v.sku.toLowerCase().includes(q))
      );
    });
  }, [productos, busqueda, categoriaFiltro]);

  const getPrecioUnitarioItem = (item: ItemCotizacionLocal) => {
    const raw = preciosPropuestos[item.variante_id];
    const parsed = raw !== undefined && raw !== '' ? parseFloat(raw) : item.precio_unitario;
    return Number.isNaN(parsed) || parsed <= 0 ? item.precio_unitario : parsed;
  };

  const resumen = useMemo(() => {
    const subtotal = itemsCotizacion.reduce((acc, item) => acc + getPrecioUnitarioItem(item) * item.cantidad, 0);
    const totalUnidades = itemsCotizacion.reduce((acc, i) => acc + i.cantidad, 0);
    return { subtotal, totalUnidades };
  }, [itemsCotizacion, preciosPropuestos]);

  const varianteSeleccionada = useMemo(() => {
    if (!productoSeleccionado || !varianteId) return null;
    return productoSeleccionado.variantes.find((v) => String(v.id) === varianteId);
  }, [productoSeleccionado, varianteId]);

  const abrirDialogoAgregar = (producto: ProductoParaCotizar) => {
    setProductoSeleccionado(producto);
    setVarianteId(producto.variantes[0] ? String(producto.variantes[0].id) : '');
    setCantidad(resolveCartMoq(producto.moq));
    setDialogAbierto(true);
  };

  const confirmarAgregar = () => {
    if (!productoSeleccionado || !varianteSeleccionada) {
      toast.error('Por favor, selecciona una combinación de color y talla');
      return;
    }
    const moqProducto = resolveCartMoq(productoSeleccionado.moq);
    if (cantidad < moqProducto) {
      toast.error(`La cantidad mínima (MOQ) es de ${moqProducto.toLocaleString()} unidades.`);
      return;
    }
    const qty = Math.max(moqProducto, Math.floor(cantidad));
    const precioBaseUnitario = productoSeleccionado.precio + varianteSeleccionada.precio_adicional;

    setItemsCotizacion((prev) => {
      const idx = prev.findIndex((i) => i.variante_id === varianteSeleccionada.id);
      if (idx >= 0) {
        const clon = [...prev];
        clon[idx] = { ...clon[idx], cantidad: clon[idx].cantidad + qty };
        return clon;
      }
      return [...prev, {
        producto_id: productoSeleccionado.id,
        variante_id: varianteSeleccionada.id,
        nombre: productoSeleccionado.nombre,
        sku: varianteSeleccionada.sku,
        color: varianteSeleccionada.color,
        talla: varianteSeleccionada.talla,
        precio_unitario: precioBaseUnitario,
        cantidad: qty,
        stock_disponible: varianteSeleccionada.stock,
      }];
    });
    toast.success(`${productoSeleccionado.nombre} añadido.`);
    setDialogAbierto(false);
    setProductoSeleccionado(null);
  };

  const quitarItem = (vid: number) => {
    setItemsCotizacion((prev) => prev.filter((i) => i.variante_id !== vid));
    setPreciosPropuestos((prev) => { const c = { ...prev }; delete c[vid]; return c; });
  };

  const modificarCantidadLinea = (vid: number, nuevoValor: number) => {
    const item = itemsCotizacion.find((i) => i.variante_id === vid);
    if (!item) return;
    const moq = resolveCartMoq(productos.find((p) => p.id === item.producto_id)?.moq ?? 1);
    setItemsCotizacion((prev) =>
      prev.map((i) => i.variante_id !== vid ? i : { ...i, cantidad: Math.max(moq, nuevoValor) })
    );
  };

  const handleEnviar = () => {
    if (itemsCotizacion.length === 0) { toast.error('Tu lista está vacía.'); return; }
    if (!mensaje.trim()) { toast.error('El mensaje es obligatorio.'); return; }
    startTransition(async () => {
      const response = await crearSolicitudCotizacion({
        mensaje: mensaje.trim(),
        items: itemsCotizacion.map((item) => ({
          producto_id: item.producto_id,
          variante_id: item.variante_id,
          cantidad: item.cantidad,
          precio_unitario: getPrecioUnitarioItem(item),
          color_snapshot: item.color,
          talla_snapshot: item.talla,
        })),
      });
      if (!response.success) {
        const dic: Record<string, string> = {
          unauthenticated: 'Tu sesión expiró.',
          cliente_no_encontrado: 'No tienes perfil comercial asignado.',
          mensaje_requerido: 'Escribe un mensaje.',
          items_requeridos: 'Incluye productos.',
          item_invalido: 'Cantidades inconsistentes.',
        };
        toast.error(dic[response.error] ?? response.error);
        return;
      }
      toast.success(`Solicitud ${response.numero} registrada.`);
      setItemsCotizacion([]); setMensaje(''); setPreciosPropuestos({});
      router.push('/portal/cotizaciones');
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4 pb-16">

      {/* Encabezado */}
      <header
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-5 gap-4"
        style={{ borderColor: 'var(--guor-stone)' }}
      >
        <div className="space-y-1">
          <Link
            href="/portal/cotizaciones"
            className="inline-flex items-center gap-1 text-xs font-bold transition-colors"
            style={{ color: 'var(--guor-gold)' }}
          >
            <ChevronLeft size={14} /> Regresar
          </Link>
          <h1
            className="text-2xl font-black tracking-tight flex items-center gap-2"
            style={{ color: 'var(--guor-dark)' }}
          >
            <FileText size={24} style={{ color: 'var(--guor-gold)' }} />
            Módulo Integrado de Cotizaciones
          </h1>
          <p className="text-xs" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
            Configure presupuestos a medida, proponga precios unitarios y adjunte consideraciones logísticas.
          </p>
        </div>
        <Link
          href="/portal/cotizaciones"
          className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-colors text-center"
          style={{
            borderColor: 'var(--guor-stone-mid)',
            color: 'var(--guor-dark)',
            backgroundColor: 'white',
          }}
        >
          Historial de Presupuestos
        </Link>
      </header>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* PANEL IZQUIERDO — Catálogo */}
        <section className="lg:col-span-5 space-y-4">
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: 'var(--guor-cream)', borderColor: 'var(--guor-stone)' }}
          >
            {/* Cabecera panel */}
            <div
              className="px-5 py-4 border-b"
              style={{ backgroundColor: 'var(--guor-cream-deep)', borderColor: 'var(--guor-stone)' }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: 'var(--guor-dark)', opacity: 0.5 }}
              >
                Catálogo de Modelos
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>
                Filtre existencias y añada variaciones al panel derecho.
              </p>
            </div>

            <div className="p-4 space-y-3">
              {/* Buscador + filtro */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--guor-dark)', opacity: 0.35 }} />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, SKU..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid var(--guor-stone)',
                      color: 'var(--guor-dark)',
                    }}
                  />
                </div>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="text-xs rounded-xl px-3 py-2 outline-none transition-all"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--guor-stone)',
                    color: 'var(--guor-dark)',
                    minWidth: '140px',
                  }}
                >
                  <option value={TODAS_CATEGORIAS}>Todo el catálogo</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Lista productos */}
              {productosFiltrados.length === 0 ? (
                <div
                  className="text-center py-12 text-xs rounded-xl border-2 border-dashed"
                  style={{ borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)', opacity: 0.4 }}
                >
                  Ningún modelo coincide con los filtros.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
                  {productosFiltrados.map((prod) => (
                    <div
                      key={prod.id}
                      className="group rounded-xl overflow-hidden border transition-all flex flex-col"
                      style={{ backgroundColor: 'white', borderColor: 'var(--guor-stone)' }}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: 'var(--guor-cream-deep)' }}>
                        {prod.imagen ? (
                          <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--guor-dark)', opacity: 0.3 }}>
                            Sin imagen
                          </div>
                        )}
                        {prod.categoria && (
                          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--guor-dark)', color: 'white' }}>
                            {prod.categoria.nombre}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--guor-gold)', color: 'white' }}>
                          MOQ: {prod.moq} u.
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                        <div>
                          <h4 className="font-black text-xs line-clamp-1 transition-colors" style={{ color: 'var(--guor-dark)' }}>
                            {prod.nombre}
                          </h4>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>{prod.sku}</p>
                          <p className="text-xs font-black mt-1" style={{ color: 'var(--guor-gold)' }}>
                            {formatCurrency(prod.precio)} <span className="text-[10px] font-normal" style={{ opacity: 0.5 }}>base</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => abrirDialogoAgregar(prod)}
                          className="w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1"
                          style={{
                            backgroundColor: 'var(--guor-cream-deep)',
                            borderColor: 'var(--guor-gold-pale)',
                            color: 'var(--guor-gold)',
                          }}
                        >
                          <PlusCircle size={12} />
                          Configurar Línea
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PANEL DERECHO — Desglose */}
        <section className="lg:col-span-7 space-y-4">
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: 'var(--guor-cream)', borderColor: 'var(--guor-stone)' }}
          >
            {/* Cabecera panel */}
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ backgroundColor: 'var(--guor-cream-deep)', borderColor: 'var(--guor-stone)' }}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                  Desglose Financiero Propuesto
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>
                  {itemsCotizacion.length === 0
                    ? 'Sin productos en lista.'
                    : `${itemsCotizacion.length} SKUs · ${resumen.totalUnidades} unidades totales`}
                </p>
              </div>
              {itemsCotizacion.length > 0 && (
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                  style={{ backgroundColor: 'var(--guor-gold-dust)', borderColor: 'var(--guor-gold-pale)', color: 'var(--guor-gold)' }}
                >
                  Borrador Activo
                </span>
              )}
            </div>

            <div className="p-4">
              {itemsCotizacion.length === 0 ? (
                <div
                  className="text-center py-14 text-xs rounded-xl border-2 border-dashed"
                  style={{ borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)', opacity: 0.35 }}
                >
                  Seleccione variaciones del catálogo para comenzar la estimación.
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--guor-stone)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--guor-cream-deep)', borderBottom: '1px solid var(--guor-stone)' }}>
                          {['Producto/SKU', 'Cant.', 'Precio Propuesto', 'Subtotal', ''].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-wider" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {itemsCotizacion.map((item) => {
                          const precioRender = getPrecioUnitarioItem(item);
                          const moqLinea = resolveCartMoq(productos.find((p) => p.id === item.producto_id)?.moq ?? 1);
                          return (
                            <tr
                              key={item.variante_id}
                              className="border-b transition-colors"
                              style={{ borderColor: 'var(--guor-stone)', backgroundColor: 'white' }}
                            >
                              <td className="px-3 py-3">
                                <p className="font-black line-clamp-1" style={{ color: 'var(--guor-dark)' }}>{item.nombre}</p>
                                <p className="font-mono mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>{item.sku}</p>
                                <div className="flex gap-1.5 mt-1">
                                  {[item.color, item.talla].map((val) => (
                                    <span key={val} className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'var(--guor-stone)', color: 'var(--guor-dark)' }}>
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div
                                  className="flex items-center rounded-lg overflow-hidden border w-fit mx-auto"
                                  style={{ borderColor: 'var(--guor-stone)' }}
                                >
                                  <button type="button" className="px-2 py-1.5 transition-colors hover:bg-guor-cream-deep" onClick={() => modificarCantidadLinea(item.variante_id, item.cantidad - 1)}>
                                    <Minus size={11} style={{ color: 'var(--guor-dark)' }} />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.cantidad}
                                    onChange={(e) => modificarCantidadLinea(item.variante_id, parseInt(e.target.value, 10) || moqLinea)}
                                    className="w-9 text-center font-black bg-transparent border-none outline-none text-xs"
                                    style={{ color: 'var(--guor-dark)' }}
                                  />
                                  <button type="button" className="px-2 py-1.5 transition-colors" onClick={() => modificarCantidadLinea(item.variante_id, item.cantidad + 1)}>
                                    <Plus size={11} style={{ color: 'var(--guor-dark)' }} />
                                  </button>
                                </div>
                                <p className="text-center text-[9px] mt-1" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>Mín. {moqLinea} u.</p>
                              </td>
                              <td className="px-3 py-3">
                                <div className="relative">
                                  <DollarSign size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--guor-dark)', opacity: 0.4 }} />
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder={item.precio_unitario.toFixed(2)}
                                    value={preciosPropuestos[item.variante_id] ?? ''}
                                    onChange={(e) => setPreciosPropuestos((prev) => ({ ...prev, [item.variante_id]: e.target.value }))}
                                    className="h-8 w-24 pl-6 text-xs font-black rounded-lg outline-none border"
                                    style={{ borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)', backgroundColor: 'var(--guor-cream)' }}
                                  />
                                </div>
                                <p className="text-[9px] mt-1 pl-1" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>
                                  Lista: {formatCurrency(item.precio_unitario)}
                                </p>
                              </td>
                              <td className="px-3 py-3 text-right font-black" style={{ color: 'var(--guor-dark)' }}>
                                {formatCurrency(precioRender * item.cantidad)}
                              </td>
                              <td className="px-3 py-3">
                                <button type="button" onClick={() => quitarItem(item.variante_id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-50">
                                  <Trash2 size={13} className="text-red-400" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con mensaje y envío */}
            {itemsCotizacion.length > 0 && (
              <div className="px-4 pb-4 space-y-4 border-t pt-4" style={{ borderColor: 'var(--guor-stone)' }}>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--guor-dark)', opacity: 0.6 }}>
                    <MessageSquare size={13} style={{ color: 'var(--guor-gold)' }} />
                    Especificaciones y Mensaje Comercial <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Ej.: Cotización para campaña Q3, entrega estimada en 3 semanas..."
                    className="w-full text-xs rounded-xl px-4 py-3 outline-none resize-none border"
                    style={{
                      backgroundColor: 'white',
                      borderColor: 'var(--guor-stone)',
                      color: 'var(--guor-dark)',
                    }}
                  />
                </div>

                {/* Subtotal */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: 'white', borderColor: 'var(--guor-stone)' }}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                      Estimado Subtotal
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.4 }}>
                      {resumen.totalUnidades} uds · sin IGV
                    </p>
                  </div>
                  <p className="text-xl font-black" style={{ color: 'var(--guor-dark)' }}>
                    {formatCurrency(resumen.subtotal)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleEnviar}
                  className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--guor-gold)' }}
                >
                  {isPending ? (
                    <><Loader2 size={14} className="animate-spin" /> Procesando...</>
                  ) : (
                    'Enviar Cotización a Revisión'
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL de variante */}
      {dialogAbierto && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--guor-cream)', border: '1px solid var(--guor-stone)' }}
          >
            {/* Header modal */}
            <div
              className="px-6 py-5 border-b flex items-center justify-between"
              style={{ backgroundColor: 'var(--guor-cream-deep)', borderColor: 'var(--guor-stone)' }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--guor-dark)' }}>
                  Configuración de Variación
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                  {productoSeleccionado.nombre}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Selector variante */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                  Combinación (Color · Talla)
                </label>
                <select
                  value={varianteId}
                  onChange={(e) => setVarianteId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl text-xs font-bold outline-none border"
                  style={{ backgroundColor: 'white', borderColor: 'var(--guor-stone)', color: 'var(--guor-dark)' }}
                >
                  {productoSeleccionado.variantes.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.color} / Talla {v.talla} — Stock: {v.stock} u.
                    </option>
                  ))}
                </select>

                {varianteSeleccionada && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--guor-stone)', color: 'var(--guor-dark)' }}>
                      {varianteSeleccionada.sku}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--guor-gold-dust)', color: 'var(--guor-gold)' }}>
                      {formatCurrency(productoSeleccionado.precio + varianteSeleccionada.precio_adicional)}
                    </span>
                  </div>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--guor-dark)', opacity: 0.5 }}>
                    Cantidad a Solicitar
                  </label>
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--guor-gold-dust)', color: 'var(--guor-gold)' }}
                  >
                    Mínimo: {resolveCartMoq(productoSeleccionado.moq)} u.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                    style={{ borderColor: 'var(--guor-stone)', backgroundColor: 'white', color: 'var(--guor-dark)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
                    className="flex-1 h-10 text-center text-sm font-black rounded-xl border outline-none"
                    style={{ borderColor: 'var(--guor-stone)', backgroundColor: 'white', color: 'var(--guor-dark)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setCantidad((c) => c + 1)}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                    style={{ borderColor: 'var(--guor-stone)', backgroundColor: 'white', color: 'var(--guor-dark)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div
              className="px-6 py-4 border-t flex gap-3"
              style={{ borderColor: 'var(--guor-stone)', backgroundColor: 'var(--guor-cream-deep)' }}
            >
              <button
                type="button"
                onClick={() => setDialogAbierto(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors"
                style={{ borderColor: 'var(--guor-stone-mid)', color: 'var(--guor-dark)', backgroundColor: 'white' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAgregar}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-colors"
                style={{ backgroundColor: 'var(--guor-gold)' }}
              >
                Añadir a la Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { crearSolicitudCotizacion } from '@/app/portal/cotizaciones/actions';
import type {
  CategoriaCotizar,
  ItemCotizacionLocal,
  ProductoParaCotizar,
} from './types';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';

const BRAND = { ocre: '#b5854b', ocreDark: '#9a6e3a' };
const TODAS_CATEGORIAS = 'todas';

type Props = {
  productos: ProductoParaCotizar[];
  categorias: CategoriaCotizar[];
};

export function NuevaCotizacionClient({ productos, categorias }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados Locales e Independientes del Flujo de Cotización
  const [itemsCotizacion, setItemsCotizacion] = useState<ItemCotizacionLocal[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS_CATEGORIAS);
  const [mensaje, setMensaje] = useState('');
  const [preciosPropuestos, setPreciosPropuestos] = useState<Record<number, string>>({});

  // Estados del Modal Selector de Variantes
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoParaCotizar | null>(null);
  const [varianteId, setVarianteId] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);

  // Filtrado reactivo en tiempo real del panel izquierdo
  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const matchCat =
        categoriaFiltro === TODAS_CATEGORIAS ||
        String(p.categoria?.id) === categoriaFiltro;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.variantes.some((v) => v.sku.toLowerCase().includes(q))
      );
    });
  }, [productos, busqueda, categoriaFiltro]);

  // Recupera el precio considerando si el usuario propuso un monto editable en la tabla
  const getPrecioUnitarioItem = (item: ItemCotizacionLocal) => {
    const raw = preciosPropuestos[item.variante_id];
    const parsed = raw !== undefined && raw !== '' ? parseFloat(raw) : item.precio_unitario;
    return Number.isNaN(parsed) || parsed <= 0 ? item.precio_unitario : parsed;
  };

  // Resolución analítica de subtotales considerando precios propuestos editables en tiempo real
  const resumen = useMemo(() => {
    const subtotal = itemsCotizacion.reduce((acc, item) => {
      const precioUnitario = getPrecioUnitarioItem(item);
      return acc + (precioUnitario * item.cantidad);
    }, 0);

    const totalUnidades = itemsCotizacion.reduce((acc, i) => acc + i.cantidad, 0);
    return { subtotal, totalUnidades };
  }, [itemsCotizacion, preciosPropuestos]);

  const varianteSeleccionada = useMemo(() => {
    if (!productoSeleccionado || !varianteId) return null;
    return productoSeleccionado.variantes.find((v) => String(v.id) === varianteId);
  }, [productoSeleccionado, varianteId]);

  const abrirDialogoAgregar = (producto: ProductoParaCotizar) => {
    const primeraVariante = producto.variantes[0];
    const moqCalculado = resolveCartMoq(producto.moq);

    setProductoSeleccionado(producto);
    setVarianteId(primeraVariante ? String(primeraVariante.id) : '');
    setCantidad(moqCalculado);
    setDialogAbierto(true);
  };

  const confirmarAgregar = () => {
    if (!productoSeleccionado || !varianteSeleccionada) {
      toast.error('Por favor, selecciona una combinación de color y talla');
      return;
    }

    const moqProducto = resolveCartMoq(productoSeleccionado.moq);
    const qty = Math.max(moqProducto, Math.floor(cantidad));

    if (cantidad < moqProducto) {
      toast.error(`Regla comercial: La cantidad mínima de compra (MOQ) para este producto es de ${moqProducto.toLocaleString()} unidades.`);
      return;
    }

    // Corrección del bug: se calcula sumando el precio base y el adicional de la variante
    const precioBaseUnitario = productoSeleccionado.precio + varianteSeleccionada.precio_adicional;

    setItemsCotizacion((prev) => {
      const indexExistente = prev.findIndex((i) => i.variante_id === varianteSeleccionada.id);

      if (indexExistente >= 0) {
        const clon = [...prev];
        clon[indexExistente] = {
          ...clon[indexExistente],
          cantidad: clon[indexExistente].cantidad + qty,
        };
        return clon;
      }

      return [
        ...prev,
        {
          producto_id: productoSeleccionado.id,
          variante_id: varianteSeleccionada.id,
          nombre: productoSeleccionado.nombre,
          sku: varianteSeleccionada.sku,
          color: varianteSeleccionada.color,
          talla: varianteSeleccionada.talla,
          precio_unitario: precioBaseUnitario,
          cantidad: qty,
          stock_disponible: varianteSeleccionada.stock,
        },
      ];
    });

    toast.success(`${productoSeleccionado.nombre} añadido a tu lista.`);
    setDialogAbierto(false);
    setProductoSeleccionado(null);
  };

  const quitarItem = (varianteIdItem: number) => {
    setItemsCotizacion((prev) => prev.filter((i) => i.variante_id !== varianteIdItem));
    setPreciosPropuestos((prev) => {
      const clon = { ...prev };
      delete clon[varianteIdItem];
      return clon;
    });
  };

  const modificarCantidadLinea = (varianteIdItem: number, nuevoValor: number) => {
    const item = itemsCotizacion.find((i) => i.variante_id === varianteIdItem);
    if (!item) return;

    const productoOriginal = productos.find((p) => p.id === item.producto_id);
    const moqMinimo = productoOriginal ? resolveCartMoq(productoOriginal.moq) : 1;

    setItemsCotizacion((prev) =>
      prev.map((i) => {
        if (i.variante_id !== varianteIdItem) return i;
        return {
          ...i,
          cantidad: Math.max(moqMinimo, nuevoValor),
        };
      })
    );
  };

  const handleEnviar = () => {
    if (itemsCotizacion.length === 0) {
      toast.error('Tu lista de cotización está vacía. Selecciona productos del panel izquierdo.');
      return;
    }
    if (!mensaje.trim()) {
      toast.error('El mensaje para el equipo comercial es obligatorio para procesar la cotización.');
      return;
    }

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
        const dicErrores: Record<string, string> = {
          unauthenticated: 'Tu sesión ha expirado, vuelve a iniciar sesión.',
          cliente_no_encontrado: 'No tienes un perfil comercial asignado.',
          mensaje_requerido: 'Por favor, describe los requerimientos en el mensaje.',
          items_requeridos: 'Es necesario incluir productos en la solicitud.',
          item_invalido: 'Existen inconsistencias en las cantidades de tu pedido.'
        };
        toast.error(dicErrores[response.error] ?? response.error);
        return;
      }

      toast.success(`¡Excelente! La solicitud ${response.numero} fue registrada con éxito.`);
      setItemsCotizacion([]);
      setMensaje('');
      setPreciosPropuestos({});
      router.push('/portal/cotizaciones');
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4 pb-16">
      {/* Encabezado Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link href="/portal/cotizaciones" className="hover:text-[#b5854b] flex items-center gap-1 transition-colors">
              <ChevronLeft size={14} /> Regresar
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-[#b5854b]" size={26} />
            Módulo Integrado de Cotizaciones
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Configure presupuestos a medida, proponga precios unitarios y adjunte consideraciones logísticas.
          </p>
        </div>
        <Link
          href="/portal/cotizaciones"
          className="text-xs font-bold uppercase tracking-wider px-4 py-2 border rounded-xl hover:bg-slate-50 transition-colors text-slate-600 text-center sm:w-auto"
        >
          Historial de Presupuestos
        </Link>
      </header>

      {/* Grid General: Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* PANEL IZQUIERDO: Catálogo de Modelos (5 Columnas) */}
        <section className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Catálogo de Productos Disponibles
              </CardTitle>
              <CardDescription className="text-xs">
                Filtre existencias y añada variaciones específicas al panel derecho.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, SKU..."
                    className="pl-9 text-xs rounded-xl h-9"
                  />
                </div>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-full sm:w-[170px] text-xs rounded-xl h-9">
                    <SelectValue placeholder="Categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODAS_CATEGORIAS}>Todo el catálogo</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {productosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs border border-dashed rounded-xl">
                  Ningún modelo coincide con los filtros provistos.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
                  {productosFiltrados.map((prod) => (
                    <div
                      key={prod.id}
                      className="group border border-slate-100 rounded-xl bg-white overflow-hidden hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                        {prod.imagen ? (
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                            Sin Imagen Referencial
                          </div>
                        )}
                        {prod.categoria && (
                          <Badge className="absolute top-2 left-2 text-[9px] font-medium bg-slate-900/80 text-white border-none backdrop-blur-xs">
                            {prod.categoria.nombre}
                          </Badge>
                        )}
                        <Badge className="absolute bottom-2 right-2 text-[9px] font-bold bg-amber-600 text-white border-none shadow-xs">
                          MOQ: {prod.moq} u.
                        </Badge>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-[#b5854b] transition-colors">
                            {prod.nombre}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tight">{prod.sku}</p>
                          <p className="text-xs font-black text-slate-900 mt-1">
                            {formatCurrency(prod.precio)} <span className="text-[10px] font-normal text-slate-400">base</span>
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-[11px] h-8 rounded-lg font-bold text-[#b5854b] border-[#b5854b]/20 hover:bg-[#fff4e2] hover:border-[#b5854b] transition-all"
                          onClick={() => abrirDialogoAgregar(prod)}
                        >
                          <PlusCircle size={12} className="mr-1" />
                          Configurar Línea
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* PANEL DERECHO: Resumen de la Solicitud (7 Columnas) */}
        <section className="lg:col-span-7 space-y-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Desglose Financiero Propuesto
                </CardTitle>
                <CardDescription className="text-xs">
                  {itemsCotizacion.length === 0
                    ? 'No hay productos en lista.'
                    : `${itemsCotizacion.length} SKUs seleccionados · ${resumen.totalUnidades} unidades totales.`}
                </CardDescription>
              </div>
              {itemsCotizacion.length > 0 && (
                <Badge variant="outline" className="text-xs font-black border-[#b5854b]/30 text-[#b5854b] bg-[#fff4e2]">
                  Borrador Activo
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4">
              {itemsCotizacion.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs bg-slate-50/50">
                  Seleccione variaciones del catálogo de la izquierda para comenzar la estimación comercial.
                </div>
              ) : (
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 text-slate-700">
                          <TableHead className="text-xs font-bold">Producto/SKU</TableHead>
                          <TableHead className="text-xs font-bold text-center">Cant.</TableHead>
                          <TableHead className="text-xs font-bold">Precio Propuesto</TableHead>
                          <TableHead className="text-xs font-bold text-right">Subtotal</TableHead>
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itemsCotizacion.map((item) => {
                          const precioRender = getPrecioUnitarioItem(item);
                          const productoDeCatalogo = productos.find((p) => p.id === item.producto_id);
                          const moqDeLinea = productoDeCatalogo ? resolveCartMoq(productoDeCatalogo.moq) : 1;

                          return (
                            <TableRow key={item.variante_id} className="hover:bg-slate-50/40 transition-colors">
                              <TableCell className="py-2.5">
                                <p className="font-bold text-slate-900 text-xs line-clamp-1">{item.nombre}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.sku}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm">Col: {item.color}</span>
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm">Tal: {item.talla}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex items-center justify-center border border-slate-200 rounded-lg bg-white h-8 w-fit mx-auto overflow-hidden shadow-xs">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-full px-2 text-slate-500 hover:bg-slate-100 rounded-none"
                                    onClick={() => modificarCantidadLinea(item.variante_id, item.cantidad - 1)}
                                  >
                                    <Minus size={11} />
                                  </Button>
                                  <input
                                    type="number"
                                    value={item.cantidad}
                                    onChange={(e) => modificarCantidadLinea(item.variante_id, parseInt(e.target.value, 10) || moqDeLinea)}
                                    className="w-9 text-center text-xs font-black bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-full px-2 text-slate-500 hover:bg-slate-100 rounded-none"
                                    onClick={() => modificarCantidadLinea(item.variante_id, item.cantidad + 1)}
                                  >
                                    <Plus size={11} />
                                  </Button>
                                </div>
                                <p className="text-[9px] text-center text-slate-400 mt-1 font-medium">Mín. {moqDeLinea} u.</p>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="relative">
                                  <DollarSign size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder={item.precio_unitario.toFixed(2)}
                                    value={preciosPropuestos[item.variante_id] ?? ''}
                                    onChange={(e) =>
                                      setPreciosPropuestos((prev) => ({
                                        ...prev,
                                        [item.variante_id]: e.target.value,
                                      }))
                                    }
                                    className="h-8 w-24 pl-5 text-xs font-bold rounded-lg focus-visible:ring-[#b5854b]"
                                  />
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1 pl-1">
                                  Lista: {formatCurrency(item.precio_unitario)}
                                </p>
                              </TableCell>
                              <TableCell className="py-2.5 text-right font-black text-xs text-slate-800">
                                {formatCurrency(precioRender * item.cantidad)}
                              </TableCell>
                              <TableCell className="py-2.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  onClick={() => quitarItem(item.variante_id)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>

            {itemsCotizacion.length > 0 && (
              <CardFooter className="flex-col items-stretch gap-4 border-t bg-slate-50/50 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1">
                    <MessageSquare size={13} className="text-[#b5854b]" />
                    Especificaciones y Mensaje Comercial <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Ej.: Cotización para campaña Q3, entrega estimada en 3 semanas o justificación de precios propuestos..."
                    className="rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-[#b5854b]"
                  />
                </div>

                <div className="bg-white border p-3 rounded-xl flex items-center justify-between text-xs font-medium text-slate-700 shadow-xs">
                  <div>
                    Estimado Subtotal Requerido:{' '}
                    <span className="font-black text-slate-900 text-sm">
                      {formatCurrency(resumen.subtotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal block">
                      ({resumen.totalUnidades} uds totales · Precios no incluyen IGV)
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={isPending}
                  onClick={handleEnviar}
                  className="w-full rounded-xl text-xs font-black uppercase tracking-wider text-white py-5 shadow-sm transition-all"
                  style={{ backgroundColor: BRAND.ocre }}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Procesando Solicitud Corporativa...
                    </>
                  ) : (
                    'Enviar Cotización a Revisión'
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </section>
      </div>

      {/* MODAL: Selector Fino de Variantes y Cantidades */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight">
              Configuración de Variación
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Defina los parámetros de confección y stock para: <strong className="text-slate-700">{productoSeleccionado?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          {productoSeleccionado && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Combinación (Color · Talla)
                </Label>
                <Select value={varianteId} onValueChange={setVarianteId}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Seleccionar variante..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productoSeleccionado.variantes.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)} className="text-xs">
                        {v.color} / Talla {v.talla} (Ref. Stock: {v.stock} u.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {varianteSeleccionada && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono font-medium text-slate-500 bg-slate-50">
                    SKU: {varianteSeleccionada.sku}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-slate-100 text-slate-700 border-none">
                    Precio Catálogo: {formatCurrency(productoSeleccionado.precio + varianteSeleccionada.precio_adicional)}
                  </Badge>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Cantidad a Solicitar
                  </Label>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Mínimo Requerido: {resolveCartMoq(productoSeleccionado.moq)} u.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 rounded-xl border-slate-200"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  >
                    <Minus size={14} />
                  </Button>
                  <Input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
                    className="w-24 text-center text-xs font-black rounded-xl h-9 focus-visible:ring-[#b5854b]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 rounded-xl border-slate-200"
                    onClick={() => setCantidad((c) => c + 1)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-xs font-bold border-slate-200"
              onClick={() => setDialogAbierto(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              className="rounded-xl text-xs font-black text-white px-5"
              style={{ backgroundColor: BRAND.ocre }}
              onClick={confirmarAgregar}
            >
              Añadir a la Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
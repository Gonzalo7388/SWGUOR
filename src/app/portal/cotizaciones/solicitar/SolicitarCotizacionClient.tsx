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
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';
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
import { crearSolicitudCotizacion } from './actions';
import type {
  CategoriaCotizar,
  ItemCotizacionLocal,
  ProductoParaCotizar,
} from './types';

const BRAND = { ocre: '#b5854b', ocreDark: '#9a6e3a' };
const TODAS_CATEGORIAS = 'todas';

type Props = {
  productos: ProductoParaCotizar[];
  categorias: CategoriaCotizar[];
};

export function SolicitarCotizacionClient({ productos, categorias }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [itemsCotizacion, setItemsCotizacion] = useState<ItemCotizacionLocal[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS_CATEGORIAS);
  const [mensaje, setMensaje] = useState('');
  const [preciosPropuestos, setPreciosPropuestos] = useState<Record<number, string>>({});

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoParaCotizar | null>(null);
  const [varianteId, setVarianteId] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);

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

  const resumen = useMemo(() => {
    const subtotal = itemsCotizacion.reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0,
    );
    const total_unidades = itemsCotizacion.reduce((acc, i) => acc + i.cantidad, 0);
    return { subtotal, total_unidades };
  }, [itemsCotizacion]);

  const varianteSeleccionada = useMemo(() => {
    if (!productoSeleccionado || !varianteId) return null;
    return productoSeleccionado.variantes.find(
      (v) => String(v.id) === varianteId,
    );
  }, [productoSeleccionado, varianteId]);

  const abrirDialogoAgregar = (producto: ProductoParaCotizar) => {
    const primera = producto.variantes[0];
    setProductoSeleccionado(producto);
    setVarianteId(primera ? String(primera.id) : '');
    setCantidad(1);
    setDialogAbierto(true);
  };

  const confirmarAgregar = () => {
    if (!productoSeleccionado || !varianteSeleccionada) {
      toast.error('Selecciona color y talla');
      return;
    }
    const qty = Math.max(1, Math.floor(cantidad));
    const precioUnitario =
      productoSeleccionado.precio + varianteSeleccionada.precio_adicional;

    setItemsCotizacion((prev) => {
      const idx = prev.findIndex(
        (i) => i.variante_id === varianteSeleccionada.id,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          cantidad: next[idx].cantidad + qty,
        };
        return next;
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
          precio_unitario: precioUnitario,
          cantidad: qty,
          stock_disponible: varianteSeleccionada.stock,
        },
      ];
    });

    toast.success(`${productoSeleccionado.nombre} agregado`);
    setDialogAbierto(false);
    setProductoSeleccionado(null);
  };

  const quitarItem = (varianteIdItem: number) => {
    setItemsCotizacion((prev) =>
      prev.filter((i) => i.variante_id !== varianteIdItem),
    );
  };

  const actualizarCantidadItem = (varianteIdItem: number, delta: number) => {
    setItemsCotizacion((prev) =>
      prev.map((item) => {
        if (item.variante_id !== varianteIdItem) return item;
        return {
          ...item,
          cantidad: Math.max(1, item.cantidad + delta),
        };
      }),
    );
  };

  const getPrecioUnitarioItem = (item: ItemCotizacionLocal) => {
    const raw = preciosPropuestos[item.variante_id];
    const parsed = raw !== undefined ? parseFloat(raw) : item.precio_unitario;
    return Number.isNaN(parsed) || parsed <= 0 ? item.precio_unitario : parsed;
  };

  const handleEnviar = () => {
    if (itemsCotizacion.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    if (!mensaje.trim()) {
      toast.error('Escribe un mensaje para el equipo comercial');
      return;
    }

    startTransition(async () => {
      const result = await crearSolicitudCotizacion({
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

      if (!result.success) {
        const errores: Record<string, string> = {
          unauthenticated: 'Debes iniciar sesión',
          cliente_no_encontrado: 'Perfil de cliente no encontrado',
          mensaje_requerido: 'El mensaje es obligatorio',
          items_requeridos: 'Agrega al menos un producto',
          item_invalido: 'Revisa cantidades y variantes',
        };
        toast.error(errores[result.error] ?? result.error);
        return;
      }

      setItemsCotizacion([]);
      setMensaje('');
      setPreciosPropuestos({});
      toast.success(`Solicitud ${result.numero} enviada`);
      router.push('/portal/cotizaciones');
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-[#b5854b]" />
            Solicitar cotización
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Arma tu solicitud con precios propuestos. Sin MOQ global — el equipo
            comercial la revisará.
          </p>
        </div>
        <Link
          href="/portal/cotizaciones"
          className="text-sm font-bold text-slate-500 hover:text-[#b5854b]"
        >
          Ver mis cotizaciones
        </Link>
      </header>

      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Catálogo</CardTitle>
          <CardDescription>
            Busca por nombre o SKU y filtra por categoría.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o SKU…"
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-xl">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_CATEGORIAS}>Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {productosFiltrados.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No hay productos que coincidan con tu búsqueda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {productosFiltrados.map((prod) => (
                <Card
                  key={prod.id}
                  className="rounded-xl border-slate-200 overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                        Sin imagen
                      </div>
                    )}
                    {prod.categoria && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-[10px]"
                      >
                        {prod.categoria.nombre}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <p className="font-bold text-sm text-slate-900 line-clamp-2">
                      {prod.nombre}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                    <p className="text-sm font-black text-slate-800">
                      {formatCurrency(prod.precio)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Stock ref. producto: {prod.stock} uds ·{' '}
                      {prod.variantes.length} variantes
                    </p>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl font-bold text-[#b5854b] border-[#b5854b]/30 hover:bg-[#fff4e2]"
                      onClick={() => abrirDialogoAgregar(prod)}
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Agregar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tu solicitud</CardTitle>
          <CardDescription>
            {itemsCotizacion.length === 0
              ? 'Aún no has agregado productos.'
              : `${itemsCotizacion.length} línea(s) · ${resumen.total_unidades} unidades`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itemsCotizacion.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500 text-sm">
              Selecciona productos del catálogo para armar tu cotización.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Producto</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead>Precio propuesto</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsCotizacion.map((item) => {
                    const precio = getPrecioUnitarioItem(item);
                    return (
                      <TableRow key={item.variante_id}>
                        <TableCell>
                          <p className="font-bold text-slate-900 text-sm">
                            {item.nombre}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.sku}</p>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-medium">{item.color}</span>
                          <span className="text-slate-400"> · {item.talla}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Stock ref.: {item.stock_disponible}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 border border-slate-200 rounded-lg w-fit mx-auto">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                actualizarCantidadItem(item.variante_id, -1)
                              }
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">
                              {item.cantidad}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                actualizarCantidadItem(item.variante_id, 1)
                              }
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-9 w-28 rounded-lg text-sm font-bold"
                            defaultValue={item.precio_unitario}
                            onChange={(e) =>
                              setPreciosPropuestos((prev) => ({
                                ...prev,
                                [item.variante_id]: e.target.value,
                              }))
                            }
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Ref.: {formatCurrency(item.precio_unitario)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm">
                          {formatCurrency(precio * item.cantidad)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600"
                            onClick={() => quitarItem(item.variante_id)}
                            aria-label="Quitar"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {itemsCotizacion.length > 0 && (
          <CardFooter className="flex-col items-stretch gap-4 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <MessageSquare size={14} />
                Mensaje para ventas
              </Label>
              <Textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Ej.: Cotización para campaña Q3, entrega estimada en 3 semanas…"
                className="rounded-xl"
              />
            </div>
            <p className="text-sm text-slate-600">
              Estimado referencial:{' '}
              <strong>{formatCurrency(resumen.subtotal)}</strong> (
              {resumen.total_unidades} uds) — sin validación de MOQ 400.
            </p>
            <Button
              type="button"
              disabled={isPending}
              onClick={handleEnviar}
              className="w-full sm:w-auto rounded-xl font-bold text-white"
              style={{ backgroundColor: BRAND.ocre }}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Enviando…
                </>
              ) : (
                'Enviar solicitud'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {productoSeleccionado?.nombre}
            </DialogTitle>
            <DialogDescription>
              Elige variante y cantidad. El stock mostrado es solo referencia.
            </DialogDescription>
          </DialogHeader>

          {productoSeleccionado && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Variante (color · talla)
                </Label>
                <Select value={varianteId} onValueChange={setVarianteId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {productoSeleccionado.variantes.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.color} · {v.talla} — stock ref. {v.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {varianteSeleccionada && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    SKU: {varianteSeleccionada.sku}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      varianteSeleccionada.stock <= 0 &&
                        'bg-amber-50 text-amber-800',
                    )}
                  >
                    Stock ref.: {varianteSeleccionada.stock} uds
                  </Badge>
                  <Badge variant="secondary">
                    Precio ref.:{' '}
                    {formatCurrency(
                      productoSeleccionado.precio +
                        varianteSeleccionada.precio_adicional,
                    )}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Cantidad
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-24 text-center font-bold rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    onClick={() => setCantidad((c) => c + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-xl text-white font-bold"
              style={{ backgroundColor: BRAND.ocre }}
              onClick={confirmarAgregar}
            >
              Agregar a la solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

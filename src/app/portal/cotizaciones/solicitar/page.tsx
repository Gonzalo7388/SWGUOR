'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
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
import { usePortal } from '../../_contexts/PortalContext';
import { ORIGEN_COTIZACION_SOLICITUD } from '@/lib/constants/portal-b2b';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { toast } from 'sonner';

const BRAND = { ocre: '#b5854b' };

type ProductoCatalogo = {
  id: string | number;
  nombre: string;
  precio: number;
  sku: string;
  variantes?: Array<{ id: number; color: string; talla: string; stock: number }>;
  colores_disponibles?: string[];
  tallas_disponibles?: string[];
};

export default function SolicitarCotizacionPage() {
  const {
    items,
    resumen,
    actualizarItem,
    eliminarDelBorrador,
    limpiarBorrador,
    agregarAlBorrador,
    cliente,
  } = usePortal();
  const router = useRouter();
  const [mensaje, setMensaje] = useState('');
  const [preciosPropuestos, setPreciosPropuestos] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState('');
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);

  const cargarCatalogo = useCallback(async (q: string) => {
    setCargandoCatalogo(true);
    try {
      const params = new URLSearchParams({ limite: '12' });
      if (q.trim()) params.set('busqueda', q.trim());
      const res = await fetch(`/api/portal/productos?${params}`);
      const json = await res.json();
      if (json.success) setCatalogo(json.data ?? []);
    } catch {
      setCatalogo([]);
    } finally {
      setCargandoCatalogo(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => cargarCatalogo(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda, cargarCatalogo]);

  const handleAgregarProducto = (prod: ProductoCatalogo) => {
    agregarAlBorrador({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1,
      variantes: prod.variantes ?? [],
      colores_disponibles: prod.colores_disponibles ?? [],
      tallas_disponibles: prod.tallas_disponibles ?? [],
    });
    toast.success(`${prod.nombre} agregado a la solicitud`);
  };

  const handlePrecioChange = (varianteId: number, valor: string) => {
    setPreciosPropuestos((prev) => ({ ...prev, [varianteId]: valor }));
  };

  const getPrecioUnitario = (item: (typeof items)[0]) => {
    const raw = preciosPropuestos[item.variante_id];
    const parsed = raw !== undefined ? parseFloat(raw) : item.precio_unitario;
    return Number.isNaN(parsed) || parsed <= 0 ? item.precio_unitario : parsed;
  };

  const handleEnviar = () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    if (!mensaje.trim()) {
      toast.error('Escribe un mensaje breve para el equipo comercial');
      return;
    }

    startTransition(async () => {
      try {
        const payloadItems = items.map((item) => ({
          producto_id: item.producto_id,
          variante_id: item.variante_id,
          cantidad: item.cantidad,
          precio_unitario: getPrecioUnitario(item),
          color_snapshot: item.color,
          talla_snapshot: item.talla,
        }));

        const res = await fetch('/api/portal/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo_solicitud: 'consulta',
            origen: ORIGEN_COTIZACION_SOLICITUD,
            notas_internas: mensaje.trim(),
            items: payloadItems,
            estado: 'enviada',
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.mensaje ?? json.error ?? 'No se pudo enviar la solicitud');
          return;
        }
        limpiarBorrador();
        setMensaje('');
        toast.success('Solicitud de cotización enviada');
        router.push('/portal/cotizaciones');
      } catch {
        toast.error('Error de conexión');
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-[#b5854b]" />
            Solicitar cotización
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Negocia precios por producto sin restricción de MOQ global. El equipo revisará tu
            propuesta.
          </p>
        </div>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-black text-slate-800">Agregar productos</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o SKU…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>
        {cargandoCatalogo ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {catalogo.map((prod) => (
              <li key={String(prod.id)} className="flex items-center justify-between py-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{prod.nombre}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(prod.precio)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAgregarProducto(prod)}
                  className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#b5854b] hover:bg-[#fff4e2] px-2 py-1 rounded-lg"
                >
                  <PlusCircle size={14} />
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="font-medium">No hay productos en la solicitud.</p>
          <p className="text-sm mt-2">Usa el buscador de arriba para agregar productos a tu solicitud.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.variante_id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1">
                  <h2 className="font-bold text-slate-900">{item.nombre}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    {item.color} · {item.talla}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-bold text-slate-500">Cantidad</span>
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button
                        type="button"
                        className="p-1.5"
                        onClick={() =>
                          actualizarItem({
                            variante_id: item.variante_id,
                            cantidad: Math.max(1, item.cantidad - 1),
                          })
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.cantidad}</span>
                      <button
                        type="button"
                        className="p-1.5"
                        onClick={() =>
                          actualizarItem({
                            variante_id: item.variante_id,
                            cantidad: item.cantidad + 1,
                          })
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="sm:w-48 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Precio propuesto (S/)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={item.precio_unitario}
                    onChange={(e) => handlePrecioChange(item.variante_id, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-400">
                    Ref. catálogo: {formatCurrency(item.precio_unitario)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => eliminarDelBorrador(item.variante_id)}
                  className="self-start text-slate-400 hover:text-red-600 p-1"
                  aria-label="Quitar"
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <MessageSquare size={14} />
                Mensaje para ventas
              </span>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Ej.: Necesito cotización para campaña Q3, entrega en 3 semanas…"
                className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />
            </label>
            <p className="text-sm text-slate-600">
              Estimado referencial:{' '}
              <strong>{formatCurrency(resumen.subtotal)}</strong> ({resumen.total_unidades}{' '}
              uds) — sin validación de MOQ 400.
            </p>
            <button
              type="button"
              disabled={isPending || !cliente}
              onClick={handleEnviar}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: BRAND.ocre }}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando…
                </>
              ) : (
                'Enviar solicitud'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

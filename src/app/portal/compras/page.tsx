'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useCartStore, selectCanCheckout } from '@/lib/store/useCartStore';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';
import { usePortal } from '../_contexts/PortalContext';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BRAND = { ocre: '#b5854b', ocreDark: '#9a6e3a' };

export default function ConfirmarCompraPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const canCheckout = useCartStore(selectCanCheckout);

  const { cliente, zonaEnvio, costosEnvio } = usePortal();
  const zonaEnvioSeleccionada = costosEnvio.find((z) => z.zona === zonaEnvio);
  const [isPending, startTransition] = useTransition();
  const [direccion, setDireccion] = useState(cliente?.direccion ?? '');

  const subtotal = getTotal();
  const puedeConfirmar = canCheckout && cliente;

  const handleConfirmar = () => {
    if (!puedeConfirmar) return;

    const sinVariante = items.filter((i) => !i.variante_id);
    if (sinVariante.length > 0) {
      toast.error('Carrito desactualizado', {
        description:
          'Quita los productos sin variante y vuelve a agregarlos desde el catálogo.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              producto_id: i.producto_id,
              variante_id: i.variante_id,
              cantidad: i.cantidad,
              precio_unitario: i.precio,
              color_snapshot: i.color,
              talla_snapshot: i.talla,
            })),
            direccion_despacho: direccion || cliente?.direccion,
            zona_envio: zonaEnvio,
            zona_envio_id: zonaEnvioSeleccionada?.id ?? null,
            costo_envio: zonaEnvioSeleccionada?.costo ?? 0,
            reservar_stock: true,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.mensaje ?? json.error ?? 'No se pudo registrar el pedido');
          return;
        }
        clearCart();
        toast.success('Pedido registrado correctamente');
        window.location.href = '/portal/pedidos';
      } catch {
        toast.error('Error de conexión al confirmar la compra');
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <ShoppingCart size={48} className="mx-auto text-slate-300" />
        <h1 className="text-2xl font-black text-slate-900">No hay productos para confirmar</h1>
        <p className="text-slate-500 text-sm">
          Agrega productos desde el catálogo o abre el carrito desde la barra superior.
        </p>
        <Link
          href="/portal/productos"
          className="inline-flex px-6 py-3 rounded-xl text-white font-bold text-sm"
          style={{ backgroundColor: BRAND.ocre }}
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="flex items-center gap-3">
        <Link
          href="/portal/productos"
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
          aria-label="Volver al catálogo"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Confirmar compra</h1>
          <p className="text-slate-500 text-sm mt-1">
            Revisa cantidades, MOQ y dirección antes de generar tu pedido.
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const moqMin = resolveCartMoq(item.moq);
            const moqOk = item.cantidad >= moqMin;
            const lineKey = `${item.producto_id}-${item.variante_id ?? 'x'}`;
            return (
              <article
                key={lineKey}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-900 truncate">{item.nombre}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {item.color} · {item.talla}
                  </p>
                  <p className="text-sm font-black mt-1">
                    {formatCurrency(item.precio)} / ud
                  </p>
                  {!moqOk && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-2">
                      <AlertTriangle size={12} />
                      Mínimo {moqMin} uds para este producto
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-slate-100"
                      onClick={() =>
                        updateQuantity(
                          item.producto_id,
                          item.variante_id,
                          item.cantidad - 1,
                        )
                      }
                      aria-label="Reducir cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold">{item.cantidad}</span>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-slate-100"
                      onClick={() =>
                        updateQuantity(
                          item.producto_id,
                          item.variante_id,
                          item.cantidad + 1,
                        )
                      }
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.producto_id, item.variante_id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 size={16} />
                  </button>
                  <p className="text-sm font-black">
                    {formatCurrency(item.precio * item.cantidad)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="bg-white border border-slate-200 rounded-2xl p-5 h-fit space-y-4 sticky top-4">
          <h2 className="font-black text-slate-900">Resumen del pedido</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Líneas</span>
            <span className="font-bold">{items.length}</span>
          </div>

          {!canCheckout && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Ajusta las cantidades: todos los productos deben cumplir su MOQ.
            </p>
          )}

          <label className="block text-xs font-bold text-slate-500 uppercase">
            Dirección de despacho
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={2}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-normal normal-case"
            />
          </label>

          <button
            type="button"
            disabled={!puedeConfirmar || isPending}
            onClick={handleConfirmar}
            className={cn(
              'w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            style={{ backgroundColor: BRAND.ocre }}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando…
              </>
            ) : (
              'Confirmar pedido'
            )}
          </button>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Se genera un pedido de venta y se reserva stock si hay disponibilidad.
          </p>

          <Link
            href="/portal/cotizaciones/solicitar"
            className="block text-center text-xs font-semibold text-[#b5854b] hover:underline"
          >
            ¿Necesitas negociar precios? Solicita una cotización
          </Link>
        </aside>
      </div>
    </div>
  );
}

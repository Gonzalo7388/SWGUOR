'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCartStore, selectCanCheckout } from '@/lib/store/useCartStore';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';
import { formatCurrency } from '@/lib/helpers/format-helpers';
import { cn } from '@/lib/utils';

interface PortalCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortalCartDrawer({ open, onOpenChange }: PortalCartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const canCheckout = useCartStore(selectCanCheckout);

  useEffect(() => setMounted(true), []);

  const total = mounted ? getTotal() : 0;
  const checkoutEnabled = mounted && canCheckout;
  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-guor-line bg-guor-surface"
      >
        {/* Cabecera con fondo sutil usando la escala de cremas de GUOR */}
        <SheetHeader className="px-5 py-4 border-b border-guor-line-soft bg-guor-hover">
          <SheetTitle className="flex items-center gap-2 text-guor-ink">
            <ShoppingCart size={20} className="text-guor-gold" />
            Carrito de compras
          </SheetTitle>
          <SheetDescription className="text-guor-soft">
            {mounted && items.length > 0
              ? `${items.length} producto(s) · ${totalUnidades} unidades`
              : 'Compra rápida B2B — solo pedidos directos'}
          </SheetDescription>
        </SheetHeader>

        {/* Contenedor del listado */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-guor-bg">
          {!mounted ? (
            <p className="text-sm text-guor-muted text-center py-8">Cargando carrito…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingCart size={40} className="mx-auto text-guor-stone-mid" />
              <p className="text-sm text-guor-soft font-medium">Tu carrito está vacío</p>
              <Link
                href="/portal/productos"
                onClick={() => onOpenChange(false)}
                className="inline-block text-sm font-bold text-guor-soft hover:text-guor-700 transition-colors hover:underline"
              >
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const moqMin = resolveCartMoq(item.moq);
                const moqOk = item.cantidad >= moqMin;
                const lineKey = `${item.producto_id}-${item.variante_id ?? 'x'}`;
                return (
                  <li
                    key={lineKey}
                    className="flex gap-3 p-3 rounded-xl border border-guor-line-soft bg-guor-surface shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    {/* Contenedor de la Imagen */}
                    <div className="w-14 h-14 rounded-lg bg-guor-stone border border-guor-line-soft overflow-hidden shrink-0 relative">
                      {item.imagen_url ? (
                        <Image
                          src={item.imagen_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-guor-muted">
                          <ShoppingCart size={20} />
                        </div>
                      )}
                    </div>

                    {/* Detalles del Item */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-guor-ink truncate">{item.nombre}</p>
                      <p className="text-[10px] text-guor-muted font-bold uppercase tracking-wider">
                        {item.color} · {item.talla}
                      </p>
                      <p className="text-xs font-bold text-guor-soft mt-0.5">
                        {formatCurrency(item.precio)}
                      </p>

                      {/* Alerta de MOQ usando la paleta semántica de status */}
                      {!moqOk && (
                        <p className="text-[10px] text-status-warning flex items-center gap-0.5 mt-1 font-medium">
                          <AlertTriangle size={10} />
                          Mín. {moqMin} uds
                        </p>
                      )}

                      {/* Selectores de Cantidad */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-guor-line-soft rounded-lg bg-guor-surface">
                          <button
                            type="button"
                            className="p-1 hover:bg-guor-hover text-guor-soft rounded-l-lg transition-colors"
                            onClick={() =>
                              updateQuantity(
                                item.producto_id,
                                item.variante_id,
                                item.cantidad - 1,
                              )
                            }
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-guor-ink">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            className="p-1 hover:bg-guor-hover text-guor-soft rounded-r-lg transition-colors"
                            onClick={() =>
                              updateQuantity(
                                item.producto_id,
                                item.variante_id,
                                item.cantidad + 1,
                              )
                            }
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Botón Eliminar con el token semántico de peligro */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.producto_id, item.variante_id)}
                          className="text-guor-muted hover:text-status-danger p-1 transition-colors"
                          aria-label="Quitar del carrito"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer del Carrito */}
        {mounted && items.length > 0 && (
          <SheetFooter className="border-t border-guor-line px-5 py-4 bg-guor-hover flex-col gap-3 sm:flex-col">
            <div className="flex justify-between w-full text-sm">
              <span className="text-guor-soft font-medium">Subtotal estimado</span>
              <span className="font-black text-guor-ink">{formatCurrency(total)}</span>
            </div>

            {/* Banner preventivo de MOQ */}
            {!checkoutEnabled && (
              <p className="w-full text-xs text-status-warning bg-guor-surface border border-guor-line rounded-lg px-3 py-2 font-medium shadow-subtle">
                Todos los productos deben cumplir su cantidad mínima (MOQ) antes de confirmar.
              </p>
            )}

            {/* Botón Principal: Confirmar compra (Usa el Champagne Gold de la marca mediante bg-primary) */}
            <Link
              href="/portal/compras"
              onClick={() => onOpenChange(false)}
              className={cn(
                'w-full py-3 rounded-xl text-center font-bold text-sm text-primary-foreground shadow-gold transition-all',
                checkoutEnabled
                  ? 'bg-primary hover:bg-guor-700 active:scale-[0.99]'
                  : 'pointer-events-none opacity-40 bg-guor-stone-mid shadow-none text-guor-muted',
              )}
              aria-disabled={!checkoutEnabled}
            >
              Confirmar compra
            </Link>

            <Link
              href="/portal/productos"
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-xs font-semibold text-guor-soft hover:text-guor-700 hover:underline transition-colors"
            >
              Seguir comprando
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
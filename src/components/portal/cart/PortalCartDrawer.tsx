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

const BRAND = { ocre: '#b5854b', ocreDark: '#9a6e3a' };

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
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-[#e4c28a]/40"
      >
        <SheetHeader className="px-5 py-4 border-b border-slate-100 bg-[#fff4e2]/50">
          <SheetTitle className="flex items-center gap-2 text-[#231e1d]">
            <ShoppingCart size={20} className="text-[#b5854b]" />
            Carrito de compras
          </SheetTitle>
          <SheetDescription>
            {mounted && items.length > 0
              ? `${items.length} producto(s) · ${totalUnidades} unidades`
              : 'Compra rápida B2B — solo pedidos directos'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!mounted ? (
            <p className="text-sm text-slate-400 text-center py-8">Cargando carrito…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingCart size={40} className="mx-auto text-slate-200" />
              <p className="text-sm text-slate-500 font-medium">Tu carrito está vacío</p>
              <Link
                href="/portal/productos"
                onClick={() => onOpenChange(false)}
                className="inline-block text-sm font-bold text-[#b5854b] hover:underline"
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
                    className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-white"
                  >
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
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
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingCart size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {item.color} · {item.talla}
                      </p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {formatCurrency(item.precio)}
                      </p>
                      {!moqOk && (
                        <p className="text-[10px] text-amber-700 flex items-center gap-0.5 mt-1">
                          <AlertTriangle size={10} />
                          Mín. {moqMin} uds
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-50 rounded-l-lg"
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
                          <span className="w-8 text-center text-xs font-bold">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            className="p-1 hover:bg-slate-50 rounded-r-lg"
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
                        <button
                          type="button"
                          onClick={() => removeItem(item.producto_id, item.variante_id)}
                          className="text-slate-400 hover:text-red-600 p-1"
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

        {mounted && items.length > 0 && (
          <SheetFooter className="border-t border-slate-100 px-5 py-4 bg-slate-50/80 flex-col gap-3 sm:flex-col">
            <div className="flex justify-between w-full text-sm">
              <span className="text-slate-500 font-medium">Subtotal estimado</span>
              <span className="font-black text-slate-900">{formatCurrency(total)}</span>
            </div>

            {!checkoutEnabled && (
              <p className="w-full text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Todos los productos deben cumplir su cantidad mínima (MOQ) antes de confirmar.
              </p>
            )}

            <Link
              href="/portal/compras"
              onClick={() => onOpenChange(false)}
              className={cn(
                'w-full py-3 rounded-xl text-center text-white font-bold text-sm transition-opacity',
                !checkoutEnabled && 'pointer-events-none opacity-50',
              )}
              style={{ backgroundColor: BRAND.ocre }}
              aria-disabled={!checkoutEnabled}
            >
              Confirmar compra
            </Link>

            <Link
              href="/portal/productos"
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-xs font-semibold text-[#b5854b] hover:underline"
            >
              Seguir comprando
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

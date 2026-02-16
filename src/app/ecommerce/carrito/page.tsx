'use client';

import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import CartItemRow from '@/components/ecommerce/carrito/CartItemRow';
import CartFinancialSummary from '@/components/ecommerce/carrito/CartFinancialSummary';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CarritoPage() {
  const { items } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-slate-50 rounded-[3rem] p-12 inline-block">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-2">Tu carrito está vacío</h1>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Parece que aún no has añadido stock para tu pedido mayorista.</p>
          <Link
            href="/ecommerce"
            className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all inline-block shadow-xl shadow-slate-200"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link href="/ecommerce" className="p-3 bg-slate-100 rounded-full hover:bg-black hover:text-white transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900">Resumen del Pedido</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Gestión de Stock Mayorista</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Lista de Productos (Columna Izquierda) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden md:grid grid-cols-5 px-8 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-2">Producto / Detalle</div>
            <div className="text-center">Cantidad</div>
            <div className="text-center">P. Unitario</div>
            <div className="text-right">Subtotal</div>
          </div>
          {items.map((item) => (
            <CartItemRow key={`${item.id}-${item.talla}-${item.color}`} item={item} />
          ))}
        </div>

        {/* Resumen Financiero (Columna Derecha) */}
        <div className="lg:sticky lg:top-24">
          <CartFinancialSummary items={items} />
        </div>
      </div>
    </div>
  );
}
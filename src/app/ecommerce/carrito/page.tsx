'use client';

import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import CartSummary from '@/components/ecommerce/carrito/CartSummary';
import Link from 'next/link';

export default function CarritoPage() {
  const { items } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>
        <div className="text-center">
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <Link
            href="/ecommerce"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Volver a comprar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>
      <CartSummary />
    </div>
  );
}

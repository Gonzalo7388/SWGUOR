'use client';

import { ReactNode } from 'react';
import Encabezado from '@/components/ecommerce/layout/Header';
import PiePagina from '@/components/ecommerce/layout/Footer';
import { EcommerceProvider } from './_contexts/AuthContext';
import { CartProvider } from './_contexts/CartContext';

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <EcommerceProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Encabezado />
          <main className="grow">
            {children}
          </main>
          <PiePagina />
        </div>
      </CartProvider>
    </EcommerceProvider>
  );
}
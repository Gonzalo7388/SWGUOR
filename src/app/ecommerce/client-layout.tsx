'use client';

import { ReactNode } from 'react';
import Encabezado from '@/components/ecommerce/layout/Header';
import PiePagina from '@/components/ecommerce/layout/Footer';
import { EcommerceProvider } from './_contexts/AuthContext';
import { CartProvider } from './_contexts/CartContext';
import { FavoritosProvider } from './_contexts/FavoritosContext';

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <EcommerceProvider>
      <CartProvider>
        <FavoritosProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <Encabezado />
            <main className="grow">
              {children}
            </main>
            <PiePagina />
          </div>
        </FavoritosProvider>
      </CartProvider>
    </EcommerceProvider>
  );
}
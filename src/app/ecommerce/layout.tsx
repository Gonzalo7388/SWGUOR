'use client';

import { ReactNode } from 'react';
import Encabezado from './_components/Header';
import PiePagina from './_components/Footer';

export default function DistribucionEcommerce({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Encabezado />
      <main className="flex-grow">
        {children}
      </main>
      <PiePagina />
    </div>
  );
}

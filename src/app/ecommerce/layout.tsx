'use client';

import { ReactNode } from 'react';
import Header from './_components/Header';
import Footer from './_components/Footer';

export default function EcommerceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

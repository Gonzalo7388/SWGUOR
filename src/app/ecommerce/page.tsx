'use client';

import dynamic from 'next/dynamic';
import ProductosDestacados from '@/components/ecommerce/productos/FeaturedProducts';
import PromoSection from '@/components/ecommerce/secciones/PromoSection';

// Importar HeroSlider de forma dinámica sin SSR para evitar errores de hidratación
const CarruselHeroi = dynamic(
  () => import('@/components/ecommerce/hero/HeroSlider'),
  { ssr: false, loading: () => <div className="w-full h-[70vh] md:h-[85vh] bg-gray-200 animate-pulse" /> }
);

export default function PaginaEcommerce() {
  return (
    <div className="space-y-0">
      {/* Carrusel Heroi */}
      <section className="px-4 py-8 md:py-12 max-w-7xl mx-auto w-full">
        <CarruselHeroi />
      </section>

      {/* Promociones */}
      <section className="border-t border-gray-200">
        <PromoSection />
      </section>

      {/* Productos Destacados - Principal */}
      <section className="border-t border-gray-200">
        <ProductosDestacados />
      </section>
    </div>
  );
}

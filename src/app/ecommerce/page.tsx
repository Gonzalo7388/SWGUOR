'use client';

import CarruselHeroi from '@/components/ecommerce/hero/HeroSlider';
import ProductosDestacados from '@/components/ecommerce/productos/FeaturedProducts';
import PromoSection from '@/components/ecommerce/secciones/PromoSection';

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

'use client';

import CarruselHeroi from '@/components/ecommerce/hero/HeroSlider';
import MuestraCategoria from '@/components/ecommerce/secciones/CategoryShowcase';
import ProductosDestacados from '@/components/ecommerce/productos/FeaturedProducts';
import ProductosPorCategoria from '@/components/ecommerce/secciones/ProductosPorCategoria';
import SeccionPromo from '@/components/ecommerce/secciones/PromoSection';
import SeccionBeneficios from '@/components/ecommerce/secciones/BenefitsSection';

export default function PaginaEcommerce() {
  return (
    <div className="space-y-0">
      {/* Carrusel Heroi */}
      <section className="px-4 py-8 md:py-12 max-w-7xl mx-auto w-full">
        <CarruselHeroi />
      </section>

      {/* Categorías */}
      <section className="border-t border-gray-200">
        <MuestraCategoria />
      </section>

      {/* Promociones */}
      <section className="border-t border-gray-200">
        <SeccionPromo />
      </section>

      {/* Productos Destacados */}
      <section className="border-t border-gray-200">
        <ProductosDestacados />
      </section>

      {/* Productos por Categoría */}
      <section className="border-t border-gray-200">
        <ProductosPorCategoria />
      </section>

      {/* Beneficios */}
      <section className="border-t border-gray-200">
        <SeccionBeneficios />
      </section>
    </div>
  );
}

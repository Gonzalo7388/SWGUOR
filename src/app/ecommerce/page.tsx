'use client';

import CarruselHeroi from './_components/HeroSlider';
import MuestraCategoria from './_components/CategoryShowcase';
import ProductosDestacados from './_components/FeaturedProducts';
import SeccionPromo from './_components/PromoSection';
import SeccionBeneficios from './_components/BenefitsSection';

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

      {/* Beneficios */}
      <section className="border-t border-gray-200">
        <SeccionBeneficios />
      </section>
    </div>
  );
}

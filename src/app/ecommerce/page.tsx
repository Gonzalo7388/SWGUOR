'use client';

import HeroSlider from './_components/HeroSlider';
import CategoryShowcase from './_components/CategoryShowcase';
import FeaturedProducts from './_components/FeaturedProducts';
import PromoSection from './_components/PromoSection';
import BenefitsSection from './_components/BenefitsSection';

export default function EcommercePage() {
  return (
    <div className="space-y-0">
      {/* Hero Slider */}
      <section className="px-4 py-8 md:py-12 max-w-7xl mx-auto w-full">
        <HeroSlider />
      </section>

      {/* Categories */}
      <section className="border-t border-gray-200">
        <CategoryShowcase />
      </section>

      {/* Promotions */}
      <section className="border-t border-gray-200">
        <PromoSection />
      </section>

      {/* Featured Products */}
      <section className="border-t border-gray-200">
        <FeaturedProducts />
      </section>

      {/* Benefits */}
      <section className="border-t border-gray-200">
        <BenefitsSection />
      </section>
    </div>
  );
}

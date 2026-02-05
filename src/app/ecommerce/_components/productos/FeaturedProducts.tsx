'use client';

import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import ProductCard from './ProductCard';

export default function ProductosDestacados() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 8 });

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Productos Destacados
              </h2>
              <p className="text-gray-600">Lo más vendido de nuestra colección</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg aspect-square mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-red-600">Error cargando productos: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-600">Lo más vendido de nuestra colección</p>
          </div>
          <a href="/ecommerce/productos" className="text-red-600 font-bold hover:text-red-700 text-sm md:text-base">
            Ver Todo →
          </a>
        </div>

        {productos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} size="md" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay productos disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
}

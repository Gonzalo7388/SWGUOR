'use client';

import Link from 'next/link';
import ProductCard from '../productos/ProductCard';
import { useProductosPorCategoria } from '@/lib/hooks/useProductosPorCategoria';

const ICONOS_CATEGORIA = {
  'Vestidos': '👗',
  'Blusas': '👕',
  'Pantalones': '👖',
  'Faldas': '👗',
  'Buzos': '🧥',
  'Accesorios': '👜',
  'Camisetas': '👕',
  'Chaquetas': '🧥',
  'Suéteres': '🧶',
  'Polos': '👕',
  'Jeans': '👖',
  'Casacas': '🧥',
  'Prendas Deportivas': '🏃',
  'Conjuntos': '👕',
  'Avíos': '🧵',
  'Hilos': '🧵',
};

export default function ProductosPorCategoria() {
  const { categorias, loading, error } = useProductosPorCategoria({
    limitePorCategoria: 6,
  });

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Productos por Categoría
            </h2>
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
          <div className="animate-pulse space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="bg-gray-200 rounded h-48"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-red-600">Error cargando productos: {error}</p>
        </div>
      </section>
    );
  }

  if (categorias.length === 0) {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">No hay categorías con productos disponibles</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-16 py-12 md:py-16">
      {categorias.map((categoria) => {
        const icono = ICONOS_CATEGORIA[categoria.nombre as keyof typeof ICONOS_CATEGORIA] || '📦';

        return (
          <section key={categoria.id} className="border-t border-gray-200 pt-12">
            <div className="max-w-7xl mx-auto px-4">
              {/* Encabezado de categoría */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{icono}</div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {categoria.nombre}
                    </h3>
                    {categoria.descripcion && (
                      <p className="text-gray-600 text-sm mt-1">
                        {categoria.descripcion}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      {categoria.total_productos} productos disponibles
                    </p>
                  </div>
                </div>
                {categoria.total_productos > 6 && (
                  <Link
                    href={`/ecommerce/categorias/${categoria.id}`}
                    className="text-blue-600 font-semibold hover:text-blue-700 whitespace-nowrap ml-4"
                  >
                    Ver todos →
                  </Link>
                )}
              </div>

              {/* Grid de productos */}
              {categoria.productos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {categoria.productos.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No hay productos disponibles en esta categoría
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';

export default function PromocionesPag() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 50 });

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 to-white">
      {/* Header de Ofertas */}
      <div className="bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🎁 Nuestras Ofertas Especiales</h1>
          <p className="text-red-100 text-lg md:text-xl mb-4">
            Descubre nuestros productos con los mejores precios del mercado
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/ecommerce/categorias"
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              ← Explorar Categorías
            </Link>
            <Link
              href="/ecommerce"
              className="px-6 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition"
            >
              Ir a Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl font-bold text-red-600 mb-2">40%</div>
            <p className="text-gray-600">Descuento Máximo</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-3xl font-bold text-red-600 mb-2">+{productos.length}</div>
            <p className="text-gray-600">Productos en Oferta</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-red-600 mb-2">📦</div>
            <p className="text-gray-600">Envío Gratis</p>
          </div>
        </div>

        {/* Productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error cargando ofertas: {error}</p>
            <Link
              href="/ecommerce"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        ) : productos.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Todos los Productos en Oferta</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  size="md"
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No hay productos en oferta en este momento
            </p>
            <Link
              href="/ecommerce"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Explorar productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

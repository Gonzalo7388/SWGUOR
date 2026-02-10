'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import Link from 'next/link';

interface Producto {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  stock: number;
  categoria_id?: string | number;
  categoria?: {
    id: string | number;
    nombre: string;
  };
}

export default function TodosLosProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/ecommerce/productos?limite=999');
        
        if (!response.ok) {
          throw new Error('Error obteniendo productos');
        }

        const result = await response.json();
        setProductos(result.data || []);
      } catch (err) {
        console.error('[TODOS_PRODUCTOS] Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/ecommerce" className="text-red-100 hover:text-white text-sm mb-4 inline-block">
            ← Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Todos los Productos</h1>
          <p className="text-red-100 text-lg">
            Explora nuestro catálogo completo de ropa de moda
          </p>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          // Loading State
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
          // Error State
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error: {error}</p>
            <Link
              href="/ecommerce"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Volver al Inicio
            </Link>
          </div>
        ) : productos.length > 0 ? (
          // Products Grid
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {productos.length} Producto{productos.length !== 1 ? 's' : ''} Disponible{productos.length !== 1 ? 's' : ''}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-400 rounded"></div>
            </div>
            
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
          // Empty State
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-6">
              No hay productos disponibles en este momento
            </p>
            <Link
              href="/ecommerce"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

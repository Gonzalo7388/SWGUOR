'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/app/ecommerce/_components/productos/ProductCard';
import Encabezado from '@/app/ecommerce/_components/layout/Header';
import PiePagina from '@/app/ecommerce/_components/layout/Footer';

interface Categoria {
  id: string | number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
}

interface Producto {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number;
  imagen?: string;
  categoria_id: string | number;
}

export default function PaginaCategoria() {
  const params = useParams();
  const categoriaId = params.id as string;

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener categoría
        const categResponse = await fetch(
          `/api/ecommerce/categorias?filterById=${categoriaId}`
        );
        if (categResponse.ok) {
          const categData = await categResponse.json();
          const cat = categData.data?.find((c: any) => c.id == categoriaId);
          setCategoria(cat || null);
        }

        // Obtener productos de la categoría
        const prodResponse = await fetch(
          `/api/ecommerce/categorias/${categoriaId}`
        );
        if (!prodResponse.ok) {
          throw new Error('Error obteniendo productos');
        }

        const prodData = await prodResponse.json();
        setProductos(prodData.data || []);
      } catch (err) {
        console.error('[CATEGORIA_PAGE] Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchData();
    }
  }, [categoriaId]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Encabezado />
      <main className="flex-grow">
        {/* Header de Categoría */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <>
                <div className="h-8 bg-white/20 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-2/3 animate-pulse"></div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-2">
                  {categoria?.nombre || 'Categoría'}
                </h1>
                <p className="text-red-100">
                  {categoria?.descripcion || ''}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            // Loading State
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
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
              <p className="text-red-600 text-lg">Error: {error}</p>
            </div>
          ) : productos.length > 0 ? (
            // Productos
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} size="md" />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay productos en esta categoría
              </p>
            </div>
          )}
        </div>
      </main>
      <PiePagina />
    </div>
  );
}

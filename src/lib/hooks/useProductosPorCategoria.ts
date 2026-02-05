import { useEffect, useState } from 'react';

interface Producto {
  id: number | string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  sku: string;
  stock: number;
  categoria_id: number;
}

interface CategoriaConProductos {
  id: number | string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  productos: Producto[];
  total_productos: number;
}

interface UseCategoriaProductosOptions {
  limitePorCategoria?: number;
}

export function useProductosPorCategoria(
  options: UseCategoriaProductosOptions = {}
) {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (options.limitePorCategoria) {
          params.append(
            'limite_por_categoria',
            String(options.limitePorCategoria)
          );
        }

        const response = await fetch(
          `/api/ecommerce/productos-por-categoria?${params}`
        );

        if (!response.ok) {
          throw new Error('Error obteniendo productos por categoría');
        }

        const result = await response.json();
        setCategorias(result.data || []);
      } catch (err) {
        console.error('[HOOK] Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorCategoria();
  }, [options.limitePorCategoria]);

  return {
    categorias,
    loading,
    error,
  };
}

import { useEffect, useState } from 'react';

interface ProductoData {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number;
  categoria_id?: string | number;
  imagen?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  color?: string;
  [key: string]: any;
}

interface UseProductosOptions {
  categoria?: string | number;
  busqueda?: string;
  limite?: number;
}

export function useProductosEcommerce(options: UseProductosOptions = {}) {
  const [productos, setProductos] = useState<ProductoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        
        if (options.categoria) {
          params.append('categoria_id', String(options.categoria));
        }
        
        if (options.busqueda) {
          params.append('busqueda', options.busqueda);
        }
        
        if (options.limite) {
          params.append('limite', String(options.limite));
        }

        const response = await fetch(`/api/ecommerce/productos?${params}`);
        
        if (!response.ok) {
          throw new Error('Error obteniendo productos');
        }

        const result = await response.json();
        setProductos(result.data || []);
      } catch (err) {
        console.error('[HOOK] Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [options.categoria, options.busqueda, options.limite]);

  return {
    productos,
    loading,
    error,
    refetch: () => {
      setLoading(true);
    },
  };
}

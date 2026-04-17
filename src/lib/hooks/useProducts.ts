import { useState, useEffect, useCallback } from 'react';

interface UseProductsOptions {
  categoriaId?: string;
  estado?: string;
  busqueda?: string;
  color?: string;
  talla?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
}

export function useProducts(options?: UseProductsOptions) {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (options?.categoriaId) params.append('categoria_id', options.categoriaId);
      if (options?.estado) params.append('estado', options.estado);
      if (options?.busqueda) params.append('busqueda', options.busqueda);
      if (options?.color) params.append('color', options.color);
      if (options?.talla) params.append('talla', options.talla);
      if (options?.sortOrder && options.sortOrder !== 'none') {
        params.append('sort', options.sortOrder);
      }

      const res = await fetch(`/api/admin/productos?${params.toString()}`);

      if (!res.ok) throw new Error('Error en API');

      const data = await res.json();

      setProductos(data.productos || []);
      setCategorias(data.categorias || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return { productos, categorias, loading, error, refetch: fetchProductos };
}
import { useState, useEffect, useCallback } from 'react';
import { ProductoConRelaciones, Categoria } from '@/app/admin/Panel-Administrativo/productos/types';

interface UseProductsOptions {
  categoriaId?: string;
  estado?: string;
  busqueda?: string;
  color?: string;
  talla?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
}

export function useProducts(options?: UseProductsOptions) {
  const [productos, setProductos] = useState<ProductoConRelaciones[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const catId = options?.categoriaId;
  const est = options?.estado;
  const busq = options?.busqueda;
  const color = options?.color;
  const talla = options?.talla;
  const sort = options?.sortOrder;

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (catId) params.append('categoria_id', catId);
      if (est) params.append('estado', est);
      if (busq) params.append('busqueda', busq);
      if (color) params.append('color', color);
      if (talla) params.append('talla', talla);
      if (sort && sort !== 'none') params.append('sort', sort);

      const response = await fetch(`/api/admin/productos?${params.toString()}`);

      if (!response.ok) throw new Error('Error al conectar con la API');

      const data = await response.json();

      setProductos(data.productos || data || []);
      setCategorias(data.categorias || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [catId, est, busq, color, talla, sort]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return { productos, categorias, loading, error, refetch: fetchProductos };
}
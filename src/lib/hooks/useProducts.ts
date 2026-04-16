import { useState, useEffect, useCallback } from 'react';
import { ProductoConRelaciones, Categoria } from '@/app/admin/Panel-Administrativo/productos/types';

interface UseProductsOptions {
  categoriaId?: string;
  estado?: string;
  busqueda?: string;
}

export function useProducts(options?: UseProductsOptions) {
  const [productos, setProductos] = useState<ProductoConRelaciones[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extraemos las propiedades para que el useCallback no dependa del objeto completo
  const catId = options?.categoriaId;
  const est = options?.estado;
  const busq = options?.busqueda;

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Solo agregamos si tienen valor real y no son "all"
      if (catId && catId !== 'all') params.append('categoria_id', catId);
      if (est && est !== 'all') params.append('estado', est);
      if (busq) params.append('busqueda', busq);

      const response = await fetch(`/api/admin/productos?${params.toString()}`);
      
      if (!response.ok) throw new Error('Error al conectar con la API');
      
      const data = await response.json();

      // Validamos que data sea el objeto esperado { productos, categorias }
      // Si la API solo devuelve un array, esto fallaría, por eso usamos:
      if (Array.isArray(data)) {
        setProductos(data);
      } else {
        setProductos(data.productos || []);
        setCategorias(data.categorias || []);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
    // Usamos las variables primitivas en las dependencias
  }, [catId, est, busq]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  return { productos, categorias, loading, error, refetch: fetchProductos };
}
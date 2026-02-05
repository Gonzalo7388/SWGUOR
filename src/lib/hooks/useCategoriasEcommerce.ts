import { useEffect, useState } from 'react';

interface CategoriaData {
  id: string | number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  imagen?: string;
  icono?: string;
  [key: string]: any;
}

export function useCategoriasEcommerce() {
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/ecommerce/categorias');
        
        if (!response.ok) {
          throw new Error('Error obteniendo categorías');
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

    fetchCategorias();
  }, []);

  return {
    categorias,
    loading,
    error,
    refetch: () => {
      setLoading(true);
    },
  };
}

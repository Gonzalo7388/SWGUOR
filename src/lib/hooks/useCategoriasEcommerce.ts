import { useState, useEffect } from 'react';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo_categoria?: string;
  estado?: string;
}

export function useCategoriasEcommerce() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/ecommerce/categorias');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Datos recibidos de la API:', data); // Debug
        
        if (data.success && Array.isArray(data.data)) {
          setCategorias(data.data);
          console.log('Categorías cargadas:', data.data.length); // Debug
        } else {
          console.warn('Formato de respuesta inesperado:', data);
          setCategorias([]);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}
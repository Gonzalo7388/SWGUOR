import { useState, useCallback } from 'react';
import { CrearGuiaRemision, GuiaRemision } from '@/lib/schemas/guiasRemisionSchema';

export function useGuiasRemision() {
  const [guias, setGuias] = useState<GuiaRemision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerGuias = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/guias-remision?${params}`);
      if (!response.ok) throw new Error('Error al obtener guías');
      
      const data: GuiaRemision[] = await response.json();
      setGuias(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearGuia = useCallback(async (datos: CrearGuiaRemision) => {
    try {
      const response = await fetch('/api/guias-remision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear guía');
      
      const nuevaGuia: GuiaRemision = await response.json();
      setGuias(prev => [...prev, nuevaGuia]);
      return nuevaGuia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const entregarGuia = useCallback(async (guiaId: string, firmaDestino: string, observacionesEntrega?: string) => {
    try {
      const response = await fetch(`/api/guias-remision/${guiaId}/entregar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmaDestino, observacionesEntrega }),
      });
      if (!response.ok) throw new Error('Error al entregar guía');
      
      const guiaActualizada: GuiaRemision = await response.json();
      setGuias(prev => prev.map(g => g.id === guiaId ? guiaActualizada : g));
      return guiaActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    guias,
    loading,
    error,
    obtenerGuias,
    crearGuia,
    entregarGuia,
  };
}

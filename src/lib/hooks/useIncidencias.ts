import { useState, useCallback } from 'react';
import { CrearIncidencia, Incidencia } from '@/lib/schemas/incidenciasSchema';

export function useIncidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerIncidencias = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/incidencias?${params}`);
      if (!response.ok) throw new Error('Error al obtener incidencias');
      
      const data: Incidencia[] = await response.json();
      setIncidencias(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearIncidencia = useCallback(async (datos: CrearIncidencia) => {
    try {
      const response = await fetch('/api/incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear incidencia');
      
      const nuevaIncidencia: Incidencia = await response.json();
      setIncidencias(prev => [...prev, nuevaIncidencia]);
      return nuevaIncidencia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const resolverIncidencia = useCallback(async (incidenciaId: string, resolucion: string, montoResolucion?: number) => {
    try {
      const response = await fetch(`/api/incidencias/${incidenciaId}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolucion, montoResolucion }),
      });
      if (!response.ok) throw new Error('Error al resolver incidencia');
      
      const incidenciaActualizada: Incidencia = await response.json();
      setIncidencias(prev => prev.map(i => i.id === Number(incidenciaId) ? incidenciaActualizada : i));
      return incidenciaActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const asignarIncidencia = useCallback(async (incidenciaId: string, asignadoA: string) => {
    try {
      const response = await fetch(`/api/incidencias/${incidenciaId}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asignadoA }),
      });
      if (!response.ok) throw new Error('Error al asignar incidencia');
      
      const incidenciaActualizada: Incidencia = await response.json();
      setIncidencias(prev => prev.map(i => i.id === Number(incidenciaId) ? incidenciaActualizada : i));
      return incidenciaActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    incidencias,
    loading,
    error,
    obtenerIncidencias,
    crearIncidencia,
    resolverIncidencia,
    asignarIncidencia,
  };
}

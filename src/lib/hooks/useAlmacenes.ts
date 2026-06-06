import { useState, useCallback } from 'react';
import { CrearAlmacen, Almacen, ActualizarAlmacen } from '@/lib/schemas/almacenes';

interface CapacidadAlmacen {
  capacidadMaxima: number;
  capacidadUsada: number;
  disponible: number;
  porcentaje: number;
}

function lanzarError(setError: (msg: string) => void, err: unknown): never {
  const mensaje = err instanceof Error ? err.message : 'Error desconocido';
  setError(mensaje);
  throw new Error(mensaje);
}

export function useAlmacenes() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerAlmacenes = useCallback(async (
    filtros?: Record<string, string>
  ): Promise<Almacen[]> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros ?? {});
      const res = await fetch(`/api/almacenes?${params}`);
      if (!res.ok) throw new Error('Error al obtener almacenes');

      const data: Almacen[] = await res.json();
      setAlmacenes(data);
      return data;
    } catch (err) {
      lanzarError(setError, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearAlmacen = useCallback(async (
    datos: CrearAlmacen
  ): Promise<Almacen> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/almacenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('Error al crear almacén');

      const nuevo: Almacen = await res.json();
      setAlmacenes(prev => [...prev, nuevo]);
      return nuevo;
    } catch (err) {
      lanzarError(setError, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarAlmacen = useCallback(async (
    id: string,
    datos: ActualizarAlmacen
  ): Promise<Almacen> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/almacenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('Error al actualizar almacén');

      const actualizado: Almacen = await res.json();
      setAlmacenes(prev =>
        prev.map(a => a.id === actualizado.id ? actualizado : a)
      );
      return actualizado;
    } catch (err) {
      lanzarError(setError, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const consultarCapacidad = useCallback(async (
    almacenId: string
  ): Promise<CapacidadAlmacen> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/almacenes/${almacenId}/capacidad`);
      if (!res.ok) throw new Error('Error al consultar capacidad');
      return await res.json();
    } catch (err) {
      lanzarError(setError, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarError = useCallback(() => setError(null), []);

  return {
    almacenes,
    loading,
    error,
    obtenerAlmacenes,
    crearAlmacen,
    actualizarAlmacen,
    consultarCapacidad,
    limpiarError,
  };
}
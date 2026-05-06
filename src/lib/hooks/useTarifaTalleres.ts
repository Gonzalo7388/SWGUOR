import { useState, useCallback } from 'react';
import { CrearTarifaTaller, TarifaTaller, ActualizarTarifaTaller } from '@/lib/schemas/tarifaTalleresSchema';

export function useTarifaTalleres() {
  const [tarifas, setTarifas] = useState<TarifaTaller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerTarifas = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/tarifas-talleres?${params}`);
      if (!response.ok) throw new Error('Error al obtener tarifas');
      
      const data: TarifaTaller[] = await response.json();
      setTarifas(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTarifa = useCallback(async (datos: CrearTarifaTaller) => {
    try {
      const response = await fetch('/api/tarifas-talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear tarifa');
      
      const nuevaTarifa: TarifaTaller = await response.json();
      setTarifas(prev => [...prev, nuevaTarifa]);
      return nuevaTarifa;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const actualizarTarifa = useCallback(async (id: string, datos: ActualizarTarifaTaller) => {
    try {
      const response = await fetch(`/api/tarifas-talleres/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al actualizar tarifa');
      
      const tarifaActualizada: TarifaTaller = await response.json();
      setTarifas(prev => prev.map(t => t.id === id ? tarifaActualizada : t));
      return tarifaActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const calcularCosto = useCallback(async (tarifaId: string, cantidad: number) => {
    try {
      const response = await fetch(`/api/tarifas-talleres/${tarifaId}/calcular-costo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad }),
      });
      if (!response.ok) throw new Error('Error al calcular costo');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    tarifas,
    loading,
    error,
    obtenerTarifas,
    crearTarifa,
    actualizarTarifa,
    calcularCosto,
  };
}

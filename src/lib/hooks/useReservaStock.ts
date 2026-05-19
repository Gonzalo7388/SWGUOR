import { useState, useCallback } from 'react';
import { CrearReserva, ReservaStock, ActualizarReserva } from '@/lib/schemas/reserva-stock';

export function useReservaStock() {
  const [reservas, setReservas] = useState<ReservaStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerReservas = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/reservas-stock?${params}`);
      if (!response.ok) throw new Error('Error al obtener reservas');

      const data: ReservaStock[] = await response.json();
      setReservas(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearReserva = useCallback(async (datos: CrearReserva) => {
    try {
      const response = await fetch('/api/reservas-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear reserva');

      const nuevaReserva: ReservaStock = await response.json();
      setReservas(prev => [...prev, nuevaReserva]);
      return nuevaReserva;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const utilizarReserva = useCallback(async (reservaId: string, cantidadUtilizada: number) => {
    try {
      const response = await fetch(`/api/reservas-stock/${reservaId}/utilizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidadUtilizada }),
      });
      if (!response.ok) throw new Error('Error al utilizar reserva');

      const reservaActualizada: ReservaStock = await response.json();
      setReservas(prev => prev.map(r => r.id === reservaId ? reservaActualizada : r));
      return reservaActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const cancelarReserva = useCallback(async (reservaId: string, motivoCancelacion: string) => {
    try {
      const response = await fetch(`/api/reservas-stock/${reservaId}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivoCancelacion }),
      });
      if (!response.ok) throw new Error('Error al cancelar reserva');

      setReservas(prev => prev.filter(r => r.id !== reservaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    reservas,
    loading,
    error,
    obtenerReservas,
    crearReserva,
    utilizarReserva,
    cancelarReserva,
  };
}

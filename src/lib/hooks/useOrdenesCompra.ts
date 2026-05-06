import { useState, useCallback } from 'react';
import { CrearOrdenCompra, OrdenCompra, ActualizarOrdenCompra } from '@/lib/schemas/ordenesCompraSchema';

export function useOrdenesCompra() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerOrdenes = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/ordenes-compra?${params}`);
      if (!response.ok) throw new Error('Error al obtener órdenes');
      
      const data: OrdenCompra[] = await response.json();
      setOrdenes(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearOrden = useCallback(async (datos: CrearOrdenCompra) => {
    try {
      const response = await fetch('/api/ordenes-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear orden');
      
      const nuevaOrden: OrdenCompra = await response.json();
      setOrdenes(prev => [...prev, nuevaOrden]);
      return nuevaOrden;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const actualizarOrden = useCallback(async (id: string, datos: ActualizarOrdenCompra) => {
    try {
      const response = await fetch(`/api/ordenes-compra/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al actualizar orden');
      
      const ordenActualizada: OrdenCompra = await response.json();
      setOrdenes(prev => prev.map(o => o.id === id ? ordenActualizada : o));
      return ordenActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const aprobarOrden = useCallback(async (ordenId: string, aprobadoPor: string, observaciones?: string) => {
    try {
      const response = await fetch(`/api/ordenes-compra/${ordenId}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprobadoPor, observaciones }),
      });
      if (!response.ok) throw new Error('Error al aprobar orden');
      
      const ordenActualizada: OrdenCompra = await response.json();
      setOrdenes(prev => prev.map(o => o.id === ordenId ? ordenActualizada : o));
      return ordenActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const recibirOrden = useCallback(async (ordenId: string, cantidadRecibida: number, observacionesRecepcion?: string) => {
    try {
      const response = await fetch(`/api/ordenes-compra/${ordenId}/recibir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidadRecibida, observacionesRecepcion }),
      });
      if (!response.ok) throw new Error('Error al recibir orden');
      
      const ordenActualizada: OrdenCompra = await response.json();
      setOrdenes(prev => prev.map(o => o.id === ordenId ? ordenActualizada : o));
      return ordenActualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    ordenes,
    loading,
    error,
    obtenerOrdenes,
    crearOrden,
    actualizarOrden,
    aprobarOrden,
    recibirOrden,
  };
}

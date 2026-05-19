import { useState, useCallback } from 'react';
import { CrearPago, Pago } from '@/lib/schemas/pagos';

export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerPagos = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/pagos?${params}`);
      if (!response.ok) throw new Error('Error al obtener pagos');

      const data: Pago[] = await response.json();
      setPagos(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearPago = useCallback(async (datos: CrearPago) => {
    try {
      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear pago');

      const nuevoPago: Pago = await response.json();
      setPagos(prev => [...prev, nuevoPago]);
      return nuevoPago;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const procesarPago = useCallback(async (pagoId: string, numeroTransaccion?: string, referencia?: string) => {
    try {
      const response = await fetch(`/api/pagos/${pagoId}/procesar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroTransaccion, referencia }),
      });
      if (!response.ok) throw new Error('Error al procesar pago');

      const pagoActualizado: Pago = await response.json();
      setPagos(prev => prev.map(p => p.id === Number(pagoId) ? pagoActualizado : p));
      return pagoActualizado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const rechazarPago = useCallback(async (pagoId: string, motivo: string) => {
    try {
      const response = await fetch(`/api/pagos/${pagoId}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });
      if (!response.ok) throw new Error('Error al rechazar pago');

      const pagoActualizado: Pago = await response.json();
      setPagos(prev => prev.map(p => p.id === Number(pagoId) ? pagoActualizado : p));
      return pagoActualizado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const reembolsarPago = useCallback(async (pagoId: string, motivo: string, montoReembolso: number) => {
    try {
      const response = await fetch(`/api/pagos/${pagoId}/reembolsar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, montoReembolso }),
      });
      if (!response.ok) throw new Error('Error al reembolsar pago');

      const pagoActualizado: Pago = await response.json();
      setPagos(prev => prev.map(p => p.id === Number(pagoId) ? pagoActualizado : p));
      return pagoActualizado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const generarReporte = useCallback(async (desde: Date, hasta: Date, metodoPago?: string) => {
    try {
      const params = new URLSearchParams({
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        ...(metodoPago && { metodoPago }),
      });

      const response = await fetch(`/api/pagos/reporte?${params}`);
      if (!response.ok) throw new Error('Error al generar reporte');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    pagos,
    loading,
    error,
    obtenerPagos,
    crearPago,
    procesarPago,
    rechazarPago,
    reembolsarPago,
    generarReporte,
  };
}

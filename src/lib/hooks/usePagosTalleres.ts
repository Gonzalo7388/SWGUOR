import { useState, useCallback } from 'react';
import { CrearPagoTaller, PagoTaller } from '@/lib/schemas/pagosTalleresSchema';

export function usePagosTalleres() {
  const [pagos, setPagos] = useState<PagoTaller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerPagos = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/pagos-talleres?${params}`);
      if (!response.ok) throw new Error('Error al obtener pagos');
      
      const data: PagoTaller[] = await response.json();
      setPagos(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearPago = useCallback(async (datos: CrearPagoTaller) => {
    try {
      const response = await fetch('/api/pagos-talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear pago');
      
      const nuevoPago: PagoTaller = await response.json();
      setPagos(prev => [...prev, nuevoPago]);
      return nuevoPago;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const registrarPago = useCallback(async (pagoId: string, monto: number, fecha: Date, metodoPago: string, numeroComprobante?: string) => {
    try {
      const response = await fetch(`/api/pagos-talleres/${pagoId}/registrar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto, fecha, metodoPago, numeroComprobante }),
      });
      if (!response.ok) throw new Error('Error al registrar pago');
      
      const pagoActualizado: PagoTaller = await response.json();
      setPagos(prev => prev.map(p => p.id === pagoId ? pagoActualizado : p));
      return pagoActualizado;
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
    registrarPago,
  };
}

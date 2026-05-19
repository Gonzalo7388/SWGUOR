import { useState, useCallback } from 'react';
import { CrearComprobante, Comprobante } from '@/lib/schemas/comprobantes';

export function useComprobantes() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerComprobantes = useCallback(async (filtros?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filtros || {});
      const response = await fetch(`/api/comprobantes?${params}`);
      if (!response.ok) throw new Error('Error al obtener comprobantes');

      const data: Comprobante[] = await response.json();
      setComprobantes(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearComprobante = useCallback(async (datos: CrearComprobante) => {
    try {
      const response = await fetch('/api/comprobantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error('Error al crear comprobante');

      const nuevoComprobante: Comprobante = await response.json();
      setComprobantes(prev => [...prev, nuevoComprobante]);
      return nuevoComprobante;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const anularComprobante = useCallback(async (comprobanteId: string, motivo: string) => {
    try {
      const response = await fetch(`/api/comprobantes/${comprobanteId}/anular`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });
      if (!response.ok) throw new Error('Error al anular comprobante');

      const comprobanteActualizado: Comprobante = await response.json();
      setComprobantes(prev => prev.map(c => c.id === Number(comprobanteId) ? comprobanteActualizado : c));
      return comprobanteActualizado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const enviarComprobante = useCallback(async (comprobanteId: string, emailDestino: string) => {
    try {
      const response = await fetch(`/api/comprobantes/${comprobanteId}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDestino }),
      });
      if (!response.ok) throw new Error('Error al enviar comprobante');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const descargarPDF = useCallback(async (comprobanteId: string) => {
    try {
      const response = await fetch(`/api/comprobantes/${comprobanteId}/pdf`);
      if (!response.ok) throw new Error('Error al descargar PDF');
      return await response.blob();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    comprobantes,
    loading,
    error,
    obtenerComprobantes,
    crearComprobante,
    anularComprobante,
    enviarComprobante,
    descargarPDF,
  };
}

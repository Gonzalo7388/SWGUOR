'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDespachoActivos }   from '@/lib/services/despachosServices';
import { subscribeToTracking }  from '@/lib/services/despachosServices';
import { aplanarDespacho }      from '@/lib/helpers/despachos-helpers';
import type { DespachoFlat, DespachoTracking } from '@/lib/services/despachosServices';

interface UseDespachoState {
  despachos: DespachoFlat[];
  cargando:  boolean;
  error:     string | null;
  refetch:   () => Promise<void>;
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useDespachos(): UseDespachoState {
  const [despachos, setDespachos] = useState<DespachoFlat[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Guardamos los cleanups de las suscripciones Realtime
  const cleanupRefs = useRef<(() => void)[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const raw   = await getDespachoActivos();
      const plano = raw.map(aplanarDespacho);
      setDespachos(plano);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      setCargando(false);
    }
  }, []);

  // ─── Subscripciones Realtime ───────────────────────────────────────────────
  // Por cada despacho activo escuchamos cambios en despachos_tracking
  // para actualizar el marcador del camión sin recargar toda la lista
  useEffect(() => {
    if (!despachos.length) return;

    // Limpiamos suscripciones anteriores
    cleanupRefs.current.forEach((fn) => fn());
    cleanupRefs.current = [];

    const subs = despachos
      .filter((d) => d.estado === 'en_ruta' || d.estado === 'preparando')
      .map((d) =>
        subscribeToTracking(d.id, (tracking: DespachoTracking) => {
          setDespachos((prev) =>
            prev.map((item) =>
              item.id === d.id
                ? {
                    ...item,
                    pos_actual_lat: tracking.pos_actual_lat,
                    pos_actual_lng: tracking.pos_actual_lng,
                    distancia_km:   tracking.distancia_km,
                    tiempo_min:     tracking.tiempo_min,
                  }
                : item,
            ),
          );
        }),
      );

    cleanupRefs.current = subs;

    return () => {
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];
    };
  }, [despachos.map((d) => d.id).join(',')]); // re-suscribir solo si cambia la lista de ids

  // Carga inicial
  useEffect(() => {
    cargar();
  }, [cargar]);

  return { despachos, cargando, error, refetch: cargar };
}

// ─── Hook de una sola incidencia / modal ──────────────────────────────────────
interface UseIncidenciaState {
  status:    'idle' | 'loading' | 'success' | 'error';
  errorMsg:  string;
  submit:    (pedidoId: number, payload: SubmitPayload) => Promise<void>;
  reset:     () => void;
}

interface SubmitPayload {
  tipo:        string;
  severidad:   string;
  descripcion: string;
  foto:        File | null;
}

export function useIncidencia(): UseIncidenciaState {
  const [status,   setStatus]   = useState<UseIncidenciaState['status']>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = useCallback(
    async (pedidoId: number, { tipo, severidad, descripcion, foto }: SubmitPayload) => {
      setStatus('loading');
      setErrorMsg('');

      try {
        // Importación dinámica para evitar cargar supabase en SSR innecesariamente
        const { uploadEvidencia, createIncidenciaCliente } =
          await import('@/lib/services/despachosServices');

        const evidencia_url: string[] = [];

        if (foto) {
          const url = await uploadEvidencia(pedidoId, foto);
          evidencia_url.push(url);
        }

        await createIncidenciaCliente({
          pedido_id: pedidoId,
          tipo:      tipo as any,
          severidad: severidad as any,
          descripcion,
          evidencia_url,
        });

        setStatus('success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al enviar la incidencia.';
        setErrorMsg(msg);
        setStatus('error');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMsg('');
  }, []);

  return { status, errorMsg, submit, reset };
}
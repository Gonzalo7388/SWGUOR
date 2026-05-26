'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDespachoActivos,
  subscribeToGrupo,
  type DespachoFlat,
  type SeguimientoDespacho,
} from '@/lib/services/despachos.service';
import { aplanarDespacho } from '@/lib/helpers/despachos-helpers';

interface UseDespachoState {
  despachos: DespachoFlat[];
  cargando:  boolean;
  error:     string | null;
  refetch:   () => Promise<void>;
}

export function useDespachos(): UseDespachoState {
  const [despachos, setDespachos] = useState<DespachoFlat[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cleanupRefs = useRef<(() => void)[]>([]);

  // 1. Definición del cargador asíncrono memorizado
  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const raw = await getDespachoActivos();
      const plano = raw.map(aplanarDespacho);
      setDespachos(plano);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  }, []);

  // Calcular la cadena de IDs activos para controlar estrictamente las suscripciones externas
  const despachosActivosIds = despachos
    .filter(d => d.estado === 'en_ruta' || d.estado === 'preparando')
    .map(d => d.id)
    .join(',');

  // 2. Efecto de Realtime optimizado
  useEffect(() => {
    if (!despachosActivosIds) return;

    cleanupRefs.current.forEach(fn => fn());
    cleanupRefs.current = [];

    // Obtenemos los IDs y los mapeamos explícitamente a tipo 'number' para evitar cualquier ambigüedad de tipo en las suscripciones
    const idsParaSuscribir = despachosActivosIds
      .split(',')
      .filter(Boolean)
      .map(idStr => Number(idStr));

    const subs = idsParaSuscribir.map(numericId =>
      subscribeToGrupo(numericId, (seguimiento: SeguimientoDespacho) => {
        setDespachos(prev =>
          prev.map(item =>
            item.id === numericId
              ? { ...item, estado: seguimiento.status, ultimo_estado: seguimiento }
              : item
          )
        );
      })
    );

    cleanupRefs.current = subs;

    return () => {
      cleanupRefs.current.forEach(fn => fn());
      cleanupRefs.current = [];
    };
  }, [despachosActivosIds]);

  // 3. Inicialización controlada del componente en el cliente
  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      try {
        if (isMounted) {
          await cargar();
        }
      } catch {
        // Silenciar excepciones del ciclo de vida si el componente se desmonta antes de finalizar
      }
    };

    inicializar();

    return () => {
      isMounted = false;
    };
  }, [cargar]);

  return { despachos, cargando, error, refetch: cargar };
}
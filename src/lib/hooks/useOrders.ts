/**
 * Hook personalizado para manejar órdenes
 * Proporciona funciones para obtener, crear, actualizar y gestionar órdenes
 */

import { useCallback, useState } from 'react';
import {
  obtenerOrdenes,
  crearOrden,
  cambiarEstadoOrden,
  verificarStock,
} from '@/lib/helpers/orden-helpers';
import type {
  FiltrosOrden,
  OrdenCompleta,
  OrdenInsert,
  VerificacionStock,
  EstadoOrden,
  MetodoPago
} from '@/types/database';

interface UseOrdenesState {
  ordenes: OrdenCompleta[];
  cargando: boolean;
  error: string | null;
}

interface UseOrdenesActions {
  obtener: (filtros?: FiltrosOrden) => Promise<void>;
  crear: (
    ordenData: Omit<OrdenInsert, 'subtotal' | 'impuestos' | 'total'>,
    detalles: any[]
  ) => Promise<boolean>;
  cambiarEstado: (
    ordenId: string,
    nuevoEstado: EstadoOrden,
    dataExtra?: { metodo_pago?: MetodoPago; payment_id?: string }
  ) => Promise<boolean>;
  verificarStockDisponible: (items: Array<{ producto_id: number; cantidad: number }>) => Promise<VerificacionStock>;
  limpiar: () => void;
}

/**
 * Hook para gestionar órdenes
 */
export function useOrdenes(): UseOrdenesState & UseOrdenesActions {
  const [state, setState] = useState<UseOrdenesState>({
    ordenes: [],
    cargando: false,
    error: null
  });

  const obtener = useCallback(async (filtros?: FiltrosOrden) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerOrdenes(filtros);

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        ordenes: data || [],
        cargando: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error obteniendo órdenes',
        cargando: false
      }));
    }
  }, []);

  const crear = useCallback(
    async (
      ordenData: Omit<OrdenInsert, 'subtotal' | 'impuestos' | 'total'>,
      detalles: any[]
    ) => {
      setState(prev => ({ ...prev, cargando: true, error: null }));
      try {
        const { data, error } = await crearOrden(ordenData, detalles);

        if (error) {
          setState(prev => ({ ...prev, error, cargando: false }));
          return false;
        }

        // Refrescar lista
        await obtener();
        return true;
      } catch (err: any) {
        const errorMsg = err.message || 'Error creando orden';
        setState(prev => ({
          ...prev,
          error: errorMsg,
          cargando: false
        }));
        return false;
      }
    },
    [obtener]
  );

  const cambiarEstado = useCallback(
    async (
      ordenId: string,
      nuevoEstado: EstadoOrden,
      dataExtra?: { metodo_pago?: MetodoPago; payment_id?: string }
    ) => {
      setState(prev => ({ ...prev, cargando: true, error: null }));
      try {
        const { success, error } = await cambiarEstadoOrden(ordenId, nuevoEstado, dataExtra);

        if (error || !success) {
          setState(prev => ({
            ...prev,
            error: error || 'Error cambiando estado',
            cargando: false
          }));
          return false;
        }

        // Actualizar localmente
        setState(prev => ({
          ...prev,
          ordenes: prev.ordenes.map(o =>
            o.id === ordenId ? { ...o, estado: nuevoEstado, ...dataExtra } : o
          ),
          cargando: false
        }));

        return true;
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          error: err.message || 'Error cambiando estado',
          cargando: false
        }));
        return false;
      }
    },
    []
  );

  const verificarStockDisponible = useCallback(
    async (items: Array<{ producto_id: number; cantidad: number }>) => {
      try {
        return await verificarStock(items);
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          error: err.message || 'Error verificando stock'
        }));
        return { disponible: false, faltantes: [] };
      }
    },
    []
  );

  const limpiar = useCallback(() => {
    setState({
      ordenes: [],
      cargando: false,
      error: null
    });
  }, []);

  return {
    ...state,
    obtener,
    crear,
    cambiarEstado,
    verificarStockDisponible,
    limpiar
  };
}

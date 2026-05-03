import { useCallback, useState } from 'react';
import {
  obtenerOrdenes,
  crearOrden,
  cambiarEstadoOrden,
  verificarStock,
} from '@/lib/helpers/ordenes-helpers';
import type { MetodoPago } from '@prisma/client';

type EstadoOrden =
  | 'solicitado'
  | 'cotizado'
  | 'aprobado'
  | 'pagado'
  | 'en_proceso'
  | 'finalizado'
  | 'cancelado';

interface OrdenCompleta {
  id: number;
  cliente_id: number | null;
  cotizacion_id: number | null;
  estado: EstadoOrden | null;
  metodo_pago: MetodoPago | null;
  total_orden: number;
  total_pagado: number | null;
  saldo_pendiente: number | null;
  created_at: string | null;
  updated_at: string | null;
  fecha_prometida_entrega: string | null;
  estado_pago: string | null;
  prioridad: string | null;
  enviado_taller_at: string | null;
  recibido_taller_at: string | null;
  entregado_cliente_at: string | null;
  user_id: string | null;
  detalles?: any[];
  clientes?: { razon_social: string; ruc?: string | null } | null;
}

interface OrdenInsert {
  cliente_id?: number | null;
  cotizacion_id?: number | null;
  estado?: EstadoOrden | null;
  total_orden: number;
  total_pagado?: number | null;
  saldo_pendiente?: number | null;
  metodo_pago?: string | null;
  fecha_prometida_entrega?: string | null;
  estado_pago?: string | null;
  prioridad?: string | null;
  user_id?: string | null;
}

interface FiltrosOrden {
  estado?: EstadoOrden;
  fecha_desde?: string;
  fecha_hasta?: string;
}

interface VerificacionStock {
  disponible: boolean;
  faltantes: Array<{
    producto_id: number;
    nombre: string;
    requerido: number;
    disponible: number;
    faltante: number;
  }>;
}

interface UseOrdenesState {
  ordenes: OrdenCompleta[];
  cargando: boolean;
  error: string | null;
}

interface UseOrdenesActions {
  obtener: (filtros?: FiltrosOrden) => Promise<void>;
  crear: (
    ordenData: Omit<OrdenInsert, 'total_orden'>,
    detalles: any[]
  ) => Promise<boolean>;
  cambiarEstado: (
    ordenId: string,
    nuevoEstado: EstadoOrden,
    dataExtra?: { metodo_pago?: MetodoPago; payment_id?: string }
  ) => Promise<boolean>;
  verificarStockDisponible: (
    items: Array<{ producto_id: number; cantidad: number }>
  ) => Promise<VerificacionStock>;
  limpiar: () => void;
}

export function useOrdenes(): UseOrdenesState & UseOrdenesActions {
  const [state, setState] = useState<UseOrdenesState>({
    ordenes: [],
    cargando: false,
    error: null,
  });

  const obtener = useCallback(async (filtros?: FiltrosOrden) => {
    setState((prev) => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerOrdenes(filtros);
      if (error) {
        setState((prev) => ({ ...prev, error, cargando: false }));
        return;
      }
      setState((prev) => ({
        ...prev,
        ordenes: ((data ?? []) as unknown as OrdenCompleta[]),
        cargando: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || 'Error obteniendo órdenes',
        cargando: false,
      }));
    }
  }, []);

  const crear = useCallback(
    async (
      ordenData: Omit<OrdenInsert, 'total_orden'>,
      detalles: any[]
    ) => {
      setState((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        const { error } = await crearOrden(ordenData as any, detalles);
        if (error) {
          setState((prev) => ({ ...prev, error, cargando: false }));
          return false;
        }
        await obtener();
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: err.message || 'Error creando orden',
          cargando: false,
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
      setState((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        const { success, error } = await cambiarEstadoOrden(
          ordenId,
          nuevoEstado,
          dataExtra
        );
        if (error || !success) {
          setState((prev) => ({
            ...prev,
            error: error || 'Error cambiando estado',
            cargando: false,
          }));
          return false;
        }
        setState((prev) => ({
          ...prev,
          ordenes: prev.ordenes.map((o) =>
            o.id === Number(ordenId)
              ? { ...o, estado: nuevoEstado, ...dataExtra }
              : o
          ),
          cargando: false,
        }));
        return true;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: err.message || 'Error cambiando estado',
          cargando: false,
        }));
        return false;
      }
    },
    []
  );

  const verificarStockDisponible = useCallback(
    async (items: Array<{ producto_id: number; cantidad: number }>) => {
      try {

        const resultado = await verificarStock(
          items.map((i) => ({ ...i, producto_id: String(i.producto_id) }))
        );

        return {
          disponible: resultado.disponible ?? false,
          faltantes: (resultado.faltantes ?? []).map((f: any) => ({
            producto_id: Number(f.producto_id),
            nombre:      f.nombre     ?? '',
            requerido:   f.requerido  ?? 0,
            disponible:  f.disponible ?? 0,
            faltante:    f.faltante   ?? 0,
          })),
        } satisfies VerificacionStock;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: err.message || 'Error verificando stock',
        }));
        return { disponible: false, faltantes: [] };
      }
    },
    []
  );

  const limpiar = useCallback(() => {
    setState({ ordenes: [], cargando: false, error: null });
  }, []);

  return {
    ...state,
    obtener,
    crear,
    cambiarEstado,
    verificarStockDisponible,
    limpiar,
  };
}
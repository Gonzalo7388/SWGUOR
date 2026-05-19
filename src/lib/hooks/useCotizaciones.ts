'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchCotizaciones,
  fetchCotizacionById,
  createCotizacion,
  aprobarCotizacion,
  rechazarCotizacion,
  actualizarEstadoCotizacion,
  fetchProductosCotizacion,
  fetchClientesCotizacion,
} from '@/lib/helpers/cotizaciones-helpers';
import type { CrearCotizacionInput } from '@/lib/services/cotizaciones.service';

export const COTIZACIONES_KEY = 'cotizaciones';
export const PRODUCTOS_COT_KEY = 'cotizaciones_productos';
export const CLIENTES_COT_KEY = 'cotizaciones_clientes';

// ── Lista de cotizaciones ──────────────────────────────────────────────────────

export function useCotizaciones(estado?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [COTIZACIONES_KEY, estado],
    queryFn: () => fetchCotizaciones(estado),
    refetchOnWindowFocus: false,
  });

  // ── Crear ────────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createCotizacion,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear cotización'); return; }
      toast.success('Cotización creada');
      queryClient.invalidateQueries({ queryKey: [COTIZACIONES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Aprobar ──────────────────────────────────────────────────────────────────
  const aprobarMutation = useMutation({
    mutationFn: (id: string) => aprobarCotizacion(id),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al aprobar'); return; }
      toast.success(res?.pedidoId
        ? `Cotización aprobada — Pedido #${res.pedidoId} generado`
        : 'Cotización aprobada'
      );
      queryClient.invalidateQueries({ queryKey: [COTIZACIONES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Rechazar ─────────────────────────────────────────────────────────────────
  const rechazarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      rechazarCotizacion(id, motivo),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al rechazar'); return; }
      toast.success('Cotización rechazada');
      queryClient.invalidateQueries({ queryKey: [COTIZACIONES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Actualizar estado ────────────────────────────────────────────────────────
  const estadoMutation = useMutation({
    mutationFn: ({ id, estado, motivo }: { id: string; estado: string; motivo?: string }) =>
      actualizarEstadoCotizacion(id, estado, motivo),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar estado'); return; }
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [COTIZACIONES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    // Datos
    cotizaciones: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,

    // Acciones
    crear: (data: CrearCotizacionInput) => createMutation.mutateAsync(data),
    aprobar: (id: string) => aprobarMutation.mutateAsync(id),
    rechazar: (id: string, motivo?: string) => rechazarMutation.mutateAsync({ id, motivo }),
    actualizarEstado: (id: string, estado: string, motivo?: string) =>
      estadoMutation.mutateAsync({ id, estado, motivo }),

    // Estados de mutación
    isCreando: createMutation.isPending,
    isAprobando: aprobarMutation.isPending,
    isRechazando: rechazarMutation.isPending,
    isActualizandoEstado: estadoMutation.isPending,
  };
}

// ── Cotización individual ─────────────────────────────────────────────────────

export function useCotizacion(id: string) {
  return useQuery({
    queryKey: [COTIZACIONES_KEY, id],
    queryFn: () => fetchCotizacionById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export function useProductosCotizacion() {
  return useQuery({
    queryKey: [PRODUCTOS_COT_KEY],
    queryFn: fetchProductosCotizacion,
    staleTime: 5 * 60 * 1000, // 5 min — los productos no cambian tan seguido
    refetchOnWindowFocus: false,
  });
}

export function useClientesCotizacion() {
  return useQuery({
    queryKey: [CLIENTES_COT_KEY],
    queryFn: fetchClientesCotizacion,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
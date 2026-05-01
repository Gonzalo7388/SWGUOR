"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchInsumos,
  fetchInsumoById,
  createInsumo,
  updateInsumo,
  ajustarStock,
  deleteInsumo,
  fetchMovimientos,
} from "@/lib/helpers/inventario-helpers";

export const INVENTARIO_KEY = "inventario";
export const MOVIMIENTOS_KEY = "movimientos_inventario";

// ── LISTA DE INSUMOS ──────────────────────────────────────────────────────────

export function useInventario(params?: {
  tipo?:      string;
  categoria?: string;
  busqueda?:  string;
  stockBajo?: boolean;
  sortOrder?: "asc" | "desc" | "none";
  limiteMovimientos?: number;
}) {
  const queryClient = useQueryClient();
  const { tipo, categoria, busqueda, stockBajo, sortOrder, limiteMovimientos } = params ?? {};

  const query = useQuery({
    queryKey: [INVENTARIO_KEY, { tipo, categoria, busqueda, stockBajo, sortOrder }],
    queryFn:  () => fetchInsumos({ tipo, categoria, busqueda, stockBajo, sortOrder }),
    refetchOnWindowFocus: false,
  });

  const movimientosQuery = useQuery({
    queryKey: [MOVIMIENTOS_KEY, { limite: limiteMovimientos }],
    queryFn:  () => fetchMovimientos({ limite: limiteMovimientos }),
    refetchOnWindowFocus: false,
  });

  // ── Crear ────────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createInsumo,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Error al crear"); return; }
      toast.success("Insumo creado");
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY] });
    },
    onError: () => toast.error("Error de conexión"),
  });

  // ── Actualizar ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateInsumo(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Error al actualizar"); return; }
      toast.success("Insumo actualizado");
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY] });
    },
    onError: () => toast.error("Error de conexión"),
  });

  // ── Ajustar Stock ────────────────────────────────────────────────────────────
  // Firma: ajustarStock(id, cantidad, operacion) → Promise<boolean>
  // Coincide exactamente con EditInsumoDialog
  const ajustarStockMutation = useMutation({
    mutationFn: ({
      id,
      cantidad,
      operacion,
      costo_unitario,
      precio_unitario,
      motivo,
    }: {
      id: string;
      cantidad: number;
      operacion: "sumar" | "restar" | "absoluto";
      costo_unitario?: number;
      precio_unitario?: number;
      motivo?: string;
    }) =>
      ajustarStock(id, {
        operacion,
        cantidad,
        costo_unitario,
        precio_unitario,
        motivo: motivo ?? (operacion === "absoluto" ? "Ajuste manual de stock" : undefined),
      }),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Error al ajustar stock"); return; }
      toast.success("Inventario y precios actualizados");
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY] });
      queryClient.invalidateQueries({ queryKey: [MOVIMIENTOS_KEY] });
    },
    onError: () => toast.error("Error de conexión"),
  });

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteInsumo,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? "Error al eliminar"); return; }
      toast.success("Insumo eliminado");
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY] });
    },
    onError: () => toast.error("Error de conexión"),
  });

  return {
    insumos:     (query.data)?.insumos     ?? [],
    proveedores: (query.data)?.proveedores ?? [],
    movimientos: (movimientosQuery.data)?.movimientos ?? [],
    isLoading:   query.isLoading,
    refetch:     () => {
      query.refetch();
      movimientosQuery.refetch();
    },

    create: (data: any) =>
      createMutation.mutateAsync(data).then(r => r.success),

    update: (id: string, data: any) =>
      updateMutation.mutateAsync({ id, data }).then(r => r.success),

    ajustarStock: (params: { 
      id: string; 
      cantidad: number; 
      operacion: "sumar" | "restar" | "absoluto"; 
      costo_unitario?: number; 
      precio_unitario?: number; 
      motivo?: string; 
    }) => ajustarStockMutation.mutateAsync(params).then(r => r.success),

    remove: (id: string) =>
      deleteMutation.mutateAsync(id).then(r => r.success),

    isCreating:       createMutation.isPending,
    isUpdating:       updateMutation.isPending,
    isAjustandoStock: ajustarStockMutation.isPending,
    isDeleting:       deleteMutation.isPending,

    cargando:           query.isLoading || movimientosQuery.isLoading,
    error:              query.error,
    obtenerInsumosList: query.refetch,
    limpiar:            () => {
      queryClient.removeQueries({ queryKey: [INVENTARIO_KEY] });
      queryClient.removeQueries({ queryKey: [MOVIMIENTOS_KEY] });
    },
  };
}

// ── INSUMO INDIVIDUAL ─────────────────────────────────────────────────────────

export function useInsumo(id: string) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, id],
    queryFn:  () => fetchInsumoById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}

// ── HISTORIAL DE MOVIMIENTOS ──────────────────────────────────────────────────

export function useMovimientos(params?: {
  insumoId?: string;
  desde?:    string;
  hasta?:    string;
  limite?:   number;
}) {
  const { insumoId, desde, hasta, limite } = params ?? {};

  return useQuery({
    queryKey: [MOVIMIENTOS_KEY, { insumoId, desde, hasta, limite }],
    queryFn:  () => fetchMovimientos({ insumoId, desde, hasta, limite }),
    refetchOnWindowFocus: false,
  });
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMateriales,
  fetchMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  ajustarStockMaterial,
} from '@/lib/helpers/materiales-helpers';

export const MATERIALES_KEY = 'materiales';

// ── Interfaces del Dominio de Materiales ────────────────────────────────────

export interface Material {
  id:          string;
  nombre:      string;
  tipo:        string; // Ej: 'TELA', 'BOTON', 'HILO'
  sku?:        string;
  stockActual: number;
  stockMinimo: number;
  unidad:      string; // Ej: 'METROS', 'UNIDADES', 'CONOS'
  createdAt:   string;
  updatedAt:   string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success:  boolean;
  error?:   string | null;
  message?: string | null;
  data?:    T;
}

export interface UseMaterialesParams {
  tipo?:      string;
  busqueda?:  string;
  stockBajo?: boolean;
}

export interface AjustarStockInput {
  id:        string;
  operacion: 'sumar' | 'restar' | 'absoluto';
  cantidad:  number;
  motivo?:   string;
}

// ── Hook: useMateriales ─────────────────────────────────────────────────────

export function useMateriales(params?: UseMaterialesParams) {
  const queryClient = useQueryClient();

  // useQuery fuertemente tipado con la estructura de un arreglo de Materiales
  const query = useQuery<Material[], Error>({
    queryKey: [MATERIALES_KEY, params],
    queryFn: async () => {
      const res = await fetchMateriales(params);
      return res as unknown as Material[];
    },
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation<ApiResponse, Error, Record<string, unknown>>({
    mutationFn: createMaterial,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Material creado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation<ApiResponse, Error, { id: string; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) => updateMaterial(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Material actualizado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const ajustarStockMutation = useMutation<ApiResponse, Error, AjustarStockInput>({
    mutationFn: ({ id, ...data }) => ajustarStockMaterial(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al ajustar stock'); return; }
      toast.success('Stock actualizado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation<ApiResponse, Error, string>({
    mutationFn: deleteMaterial,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al eliminar'); return; }
      toast.success('Material eliminado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    materiales: query.data ?? [],
    isLoading:  query.isLoading,
    refetch:    query.refetch,

    // Exposición de funciones con tipados rigurosos y autocompletado en tus formularios
    create:       (data: Record<string, unknown>) => createMutation.mutate(data),
    update:       (id: string, data: Record<string, unknown>) => updateMutation.mutate({ id, data }),
    ajustarStock: (datos: AjustarStockInput) => ajustarStockMutation.mutate(datos),
    remove:       (id: string) => deleteMutation.mutate(id),

    isCreating:       createMutation.isPending,
    isUpdating:       updateMutation.isPending,
    isAjustandoStock: ajustarStockMutation.isPending,
    isDeleting:       deleteMutation.isPending,
  };
}

// ── Hook: useMaterial (Detalle Individual) ──────────────────────────────────

export function useMaterial(id: string) {
  return useQuery<Material, Error>({
    queryKey: [MATERIALES_KEY, id],
    queryFn: async () => {
      const res = await fetchMaterialById(id);
      return res as unknown as Material;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}
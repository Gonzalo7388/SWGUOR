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

export function useMateriales(params?: {
  tipo?:      string;
  busqueda?:  string;
  stockBajo?: boolean;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [MATERIALES_KEY, params],
    queryFn:  () => fetchMateriales(params),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Material creado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMaterial(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Material actualizado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const ajustarStockMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; operacion: 'sumar' | 'restar' | 'absoluto'; cantidad: number; motivo?: string }) =>
      ajustarStockMaterial(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al ajustar stock'); return; }
      toast.success('Stock actualizado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation({
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

    create:       (data: any)                         => createMutation.mutate(data),
    update:       (id: string, data: any)             => updateMutation.mutate({ id, data }),
    ajustarStock: (id: string, operacion: 'sumar' | 'restar' | 'absoluto', cantidad: number, motivo?: string) =>
      ajustarStockMutation.mutate({ id, operacion, cantidad, motivo }),
    remove:       (id: string)                        => deleteMutation.mutate(id),

    isCreating:       createMutation.isPending,
    isUpdating:       updateMutation.isPending,
    isAjustandoStock: ajustarStockMutation.isPending,
    isDeleting:       deleteMutation.isPending,
  };
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: [MATERIALES_KEY, id],
    queryFn:  () => fetchMaterialById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPrecioHistorico,
  createPrecioHistorico,
  updatePrecioHistorico,
  deletePrecioHistorico,
} from '@/lib/helpers/precio-historico-helpers';

export const PRECIO_HISTORICO_KEY = 'precio-historico';

export function usePrecioHistorico(producto_id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PRECIO_HISTORICO_KEY, producto_id],
    queryFn: () => fetchPrecioHistorico(producto_id),
    enabled: !!producto_id,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createPrecioHistorico,
    onSuccess: () => {
      toast.success('Registro de precio histórico creado');
      queryClient.invalidateQueries({ queryKey: [PRECIO_HISTORICO_KEY, producto_id] });
    },
    onError: () => toast.error('Error al crear registro'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePrecioHistorico(id, data),
    onSuccess: () => {
      toast.success('Precio histórico actualizado');
      queryClient.invalidateQueries({ queryKey: [PRECIO_HISTORICO_KEY, producto_id] });
    },
    onError: () => toast.error('Error al actualizar registro'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrecioHistorico,
    onSuccess: () => {
      toast.success('Registro eliminado');
      queryClient.invalidateQueries({ queryKey: [PRECIO_HISTORICO_KEY, producto_id] });
    },
    onError: () => toast.error('Error al eliminar registro'),
  });

  return {
    historico: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,

    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

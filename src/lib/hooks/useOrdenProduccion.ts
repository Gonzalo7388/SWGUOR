'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchOrdenesProduccion,
  createOrdenProduccion,
  updateOrdenProduccion,
  registrarEtapaProduccion,
} from '@/lib/helpers/ordenes-produccion-helpers';

export const ORDENES_KEY = 'ordenes-produccion';

export function useOrdenesProduccion(producto_id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [ORDENES_KEY, producto_id],
    queryFn:  () => fetchOrdenesProduccion(producto_id),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createOrdenProduccion,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Orden de producción creada');
      queryClient.invalidateQueries({ queryKey: [ORDENES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateOrdenProduccion(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Orden actualizada');
      queryClient.invalidateQueries({ queryKey: [ORDENES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const etapaMutation = useMutation({
    mutationFn: registrarEtapaProduccion,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error'); return; }
      toast.success('Etapa actualizada');
      queryClient.invalidateQueries({ queryKey: [ORDENES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    ordenes:   query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    create:         (data: any)                      => createMutation.mutate(data),
    update:         (id: string, data: any)          => updateMutation.mutate({ id, data }),
    registrarEtapa: (data: { orden_id: string; etapa: string; observaciones?: string }) =>
      etapaMutation.mutate(data),

    isCreating:  createMutation.isPending,
    isUpdating:  updateMutation.isPending,
    isRegistrando: etapaMutation.isPending,
  };
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchAsientosContables,
  createAsientoContable,
  updateAsientoContable,
  deleteAsientoContable,
} from '@/lib/helpers/asientos-contables-helpers';

export const ASIENTOS_CONTABLES_KEY = 'asientos-contables';

export function useAsientosContables(filter?: { pedido_id?: string; pago_id?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [ASIENTOS_CONTABLES_KEY, filter],
    queryFn: () => fetchAsientosContables(filter),
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createAsientoContable,
    onSuccess: () => {
      toast.success('Asiento contable creado');
      queryClient.invalidateQueries({ queryKey: [ASIENTOS_CONTABLES_KEY, filter] });
    },
    onError: () => toast.error('Error al crear asiento'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAsientoContable(id, data),
    onSuccess: () => {
      toast.success('Asiento contable actualizado');
      queryClient.invalidateQueries({ queryKey: [ASIENTOS_CONTABLES_KEY, filter] });
    },
    onError: () => toast.error('Error al actualizar asiento'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsientoContable,
    onSuccess: () => {
      toast.success('Asiento eliminado');
      queryClient.invalidateQueries({ queryKey: [ASIENTOS_CONTABLES_KEY, filter] });
    },
    onError: () => toast.error('Error al eliminar asiento'),
  });

  return {
    asientos: query.data ?? [],
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

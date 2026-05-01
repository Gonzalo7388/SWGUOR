'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPedidos,
  fetchPedidoById,
  updatePedido,
  registrarSeguimientoPedido,
} from '@/lib/helpers/pedidos-helpers';

export const PEDIDOS_KEY = 'pedidos';

export function usePedidos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PEDIDOS_KEY],
    queryFn:  fetchPedidos,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePedido(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Pedido actualizado');
      queryClient.invalidateQueries({ queryKey: [PEDIDOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const seguimientoMutation = useMutation({
    mutationFn: registrarSeguimientoPedido,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error'); return; }
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [PEDIDOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    pedidos:    query.data ?? [],
    isLoading:  query.isLoading,
    refetch:    query.refetch,

    update:              (id: string, data: any)                    => updateMutation.mutate({ id, data }),
    registrarSeguimiento: (data: { pedido_id: string; status: string; notas?: string }) =>
      seguimientoMutation.mutate(data),

    isUpdating:  updateMutation.isPending,
    isRegistrando: seguimientoMutation.isPending,
  };
}

export function usePedido(id: string) {
  return useQuery({
    queryKey: [PEDIDOS_KEY, id],
    queryFn:  () => fetchPedidoById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}
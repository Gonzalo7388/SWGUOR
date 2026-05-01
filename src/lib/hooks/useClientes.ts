'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchClientes,
  fetchClienteById,
  updateCliente,
  desactivarCliente,
} from '@/lib/helpers/clientes-helpers';

export const CLIENTES_KEY = 'clientes';

export function useClientes(params?: {
  busqueda?:     string;
  tipo_cliente?: string;
  activo?:       string;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CLIENTES_KEY, params],
    queryFn:  () => fetchClientes(params),
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCliente(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Cliente actualizado');
      queryClient.invalidateQueries({ queryKey: [CLIENTES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const desactivarMutation = useMutation({
    mutationFn: desactivarCliente,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error'); return; }
      toast.success('Cliente desactivado');
      queryClient.invalidateQueries({ queryKey: [CLIENTES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    clientes:  query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    update:      (id: string, data: any) => updateMutation.mutate({ id, data }),
    desactivar:  (id: string)            => desactivarMutation.mutate(id),

    isUpdating:    updateMutation.isPending,
    isDesactivando: desactivarMutation.isPending,
  };
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [CLIENTES_KEY, id],
    queryFn:  () => fetchClienteById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}
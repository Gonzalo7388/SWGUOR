'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMaterialesCompras,
  fetchMaterialDetalleCompras,
  createMaterialCompras,
  updateMaterialCompras,
  type ListarMaterialesParams,
} from '@/lib/helpers/materiales-compras-helpers';

export const MATERIALES_COMPRAS_KEY = 'materiales_compras';

export function useMaterialesCompras(params?: ListarMaterialesParams) {
  const queryClient = useQueryClient();
  const { tipo, busqueda, stockBajo, proveedorId } = params ?? {};

  const query = useQuery({
    queryKey: [MATERIALES_COMPRAS_KEY, { tipo, busqueda, stockBajo, proveedorId }],
    queryFn: () => fetchMaterialesCompras({ tipo, busqueda, stockBajo, proveedorId }),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createMaterialCompras,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Material registrado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_COMPRAS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateMaterialCompras(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Material actualizado');
      queryClient.invalidateQueries({ queryKey: [MATERIALES_COMPRAS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    materiales: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    create: (data: Record<string, unknown>) => createMutation.mutateAsync(data),
    update: (id: string, data: Record<string, unknown>) =>
      updateMutation.mutateAsync({ id, data }),
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}

export function useMaterialDetalleCompras(id: string) {
  return useQuery({
    queryKey: [MATERIALES_COMPRAS_KEY, id],
    queryFn: () => fetchMaterialDetalleCompras(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

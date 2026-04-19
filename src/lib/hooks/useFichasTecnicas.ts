'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchFichaPorProducto,
  createFichaTecnica,
  updateFichaTecnica,
  fetchMedidas,
  saveMedidas,
  deleteMedida,
} from '@/lib/helpers/fichas-tecnicas-helpers';
import type { Medida } from '@/lib/schemas/fichas-tecnicas';

export const FICHAS_KEY  = 'fichas-tecnicas';
export const MEDIDAS_KEY = 'ficha-medidas';

export function useFichaTecnica(producto_id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [FICHAS_KEY, producto_id],
    queryFn:  () => fetchFichaPorProducto(producto_id),
    enabled:  !!producto_id,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createFichaTecnica,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear ficha'); return; }
      toast.success('Ficha técnica creada');
      queryClient.invalidateQueries({ queryKey: [FICHAS_KEY, producto_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFichaTecnica(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Ficha actualizada');
      queryClient.invalidateQueries({ queryKey: [FICHAS_KEY, producto_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    ficha:     query.data ?? null,
    isLoading: query.isLoading,
    refetch:   query.refetch,

    create: (data: any)            => createMutation.mutate(data),
    update: (id: string, data: any) => updateMutation.mutate({ id, data }),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useFichaMedidas(ficha_id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [MEDIDAS_KEY, ficha_id],
    queryFn:  () => fetchMedidas(ficha_id),
    enabled:  !!ficha_id,
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: ({ medidas }: { medidas: Omit<Medida, 'id'>[] }) =>
      saveMedidas(ficha_id, medidas),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al guardar medidas'); return; }
      toast.success('Medidas guardadas');
      queryClient.invalidateQueries({ queryKey: [MEDIDAS_KEY, ficha_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedida,
    onSuccess: () => {
      toast.success('Medida eliminada');
      queryClient.invalidateQueries({ queryKey: [MEDIDAS_KEY, ficha_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    medidas:   query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    save:   (medidas: Omit<Medida, 'id'>[]) => saveMutation.mutate({ medidas }),
    remove: (id: string)                    => deleteMutation.mutate(id),

    isSaving:  saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
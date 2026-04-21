'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchFichaDetalle,
  saveFichaDetalle,
  deleteFichaDetalleItem,
} from '@/lib/helpers/fichas-tecnicas-detalle-helpers';

export const FICHA_DETALLE_KEY = 'ficha-detalle';

export function useFichaDetalle(ficha_id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [FICHA_DETALLE_KEY, ficha_id],
    queryFn:  () => fetchFichaDetalle(ficha_id),
    enabled:  !!ficha_id,
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: (items: any[]) => saveFichaDetalle(ficha_id, items),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al guardar'); return; }
      toast.success('Detalle guardado');
      queryClient.invalidateQueries({ queryKey: [FICHA_DETALLE_KEY, ficha_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFichaDetalleItem,
    onSuccess: () => {
      toast.success('Item eliminado');
      queryClient.invalidateQueries({ queryKey: [FICHA_DETALLE_KEY, ficha_id] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    detalles:  query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    save:   (items: any[]) => saveMutation.mutate(items),
    remove: (id: string)   => deleteMutation.mutate(id),

    isSaving:  saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchTalleres,
  createTaller,
  updateTaller,
  deactivateTaller,
} from '@/lib/helpers/talleres-helpers';
import type { TallerForm } from '@/lib/schemas/talleres';

export const TALLERES_KEY = 'talleres';

export function useTalleres() {
  const queryClient = useQueryClient();

  // ── Query ──────────────────────────────────────────────────
  const query = useQuery({
    queryKey: [TALLERES_KEY],
    queryFn:  fetchTalleres,
    refetchOnWindowFocus: false,
  });

  // ── Mutación: crear ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createTaller,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error || 'Error al crear'); return; }
      toast.success('Taller creado correctamente');
      queryClient.invalidateQueries({ queryKey: [TALLERES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Mutación: actualizar ───────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TallerForm> }) =>
      updateTaller(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error || 'Error al actualizar'); return; }
      toast.success('Taller actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: [TALLERES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Mutación: eliminar ─────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deactivateTaller,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error || 'Error al eliminar'); return; }
      toast.success(res.message || 'Taller desactivado correctamente');
      queryClient.invalidateQueries({ queryKey: [TALLERES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    // datos
    talleres:  query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    // acciones
    create: (data: TallerForm)                          => createMutation.mutate(data),
    update: (id: string, data: Partial<TallerForm>)     => updateMutation.mutate({ id, data }),
    remove: (id: string)                                => deleteMutation.mutate(id),

    // estados de mutación
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
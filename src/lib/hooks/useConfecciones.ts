'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchConfecciones,
  fetchConfeccionById,
  createConfeccion,
  updateEstadoConfeccion,
  registrarSeguimientoConfeccion,
} from '@/lib/helpers/confecciones-helpers';
import type { ConfeccionOutput } from '@/lib/schemas/confecciones';

export const CONFECCIONES_KEY = 'confecciones';

export function useConfecciones(params?: {
  estado?:    string;
  taller_id?: string;
  pedido_id?: string;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CONFECCIONES_KEY, params],
    queryFn:  () => fetchConfecciones(params),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createConfeccion,
    onSuccess: () => {
      toast.success('Orden de confección creada');
      queryClient.invalidateQueries({ queryKey: [CONFECCIONES_KEY] });
    },
    onError: (err: any) => toast.error(err.message ?? 'Error al crear'),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      updateEstadoConfeccion(id, estado),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [CONFECCIONES_KEY] });
    },
    onError: (err: any) => toast.error(err.message ?? 'Error al actualizar'),
  });

  const seguimientoMutation = useMutation({
    mutationFn: registrarSeguimientoConfeccion,
    onSuccess: () => {
      toast.success('Seguimiento registrado');
      queryClient.invalidateQueries({ queryKey: [CONFECCIONES_KEY] });
    },
    onError: (err: any) => toast.error(err.message ?? 'Error'),
  });

  return {
    confecciones: query.data ?? [],
    isLoading:    query.isLoading,
    refetch:      query.refetch,

    create:              (data: ConfeccionOutput)                            => createMutation.mutate(data),
    updateEstado:        (id: string, estado: string)                       => updateEstadoMutation.mutate({ id, estado }),
    registrarSeguimiento: (data: Parameters<typeof registrarSeguimientoConfeccion>[0]) =>
      seguimientoMutation.mutate(data),

    isCreating:    createMutation.isPending,
    isUpdating:    updateEstadoMutation.isPending,
    isRegistrando: seguimientoMutation.isPending,
  };
}

export function useConfeccion(id: string) {
  return useQuery({
    queryKey: [CONFECCIONES_KEY, id],
    queryFn:  () => fetchConfeccionById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}


export function useConfeccionDetalle(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CONFECCIONES_KEY, id],
    queryFn:  () => fetchConfeccionById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ estado }: { estado: string }) =>
      updateEstadoConfeccion(id, estado),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [CONFECCIONES_KEY, id] });
    },
    onError: (err: any) => toast.error(err.message ?? 'Error al actualizar'),
  });

  const seguimientoMutation = useMutation({
    mutationFn: registrarSeguimientoConfeccion,
    onSuccess: () => {
      toast.success('Seguimiento registrado');
      queryClient.invalidateQueries({ queryKey: [CONFECCIONES_KEY, id] });
    },
    onError: (err: any) => toast.error(err.message ?? 'Error'),
  });

  return {
    confeccion:    query.data ?? null,
    isLoading:     query.isLoading,
    refetch:       query.refetch,

    updateEstado:         (estado: string) => updateEstadoMutation.mutate({ estado }),
    registrarSeguimiento: (data: Parameters<typeof registrarSeguimientoConfeccion>[0]) =>
      seguimientoMutation.mutate(data),

    isUpdating:    updateEstadoMutation.isPending,
    isRegistrando: seguimientoMutation.isPending,
  };
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchUsuarios,
  fetchUsuarioById,
  createUsuario,
  updateUsuario,
  toggleEstadoUsuario,
  deleteUsuario,
} from '@/lib/helpers/usuarios-helpers';

export const USUARIOS_KEY = 'usuarios';

export function useUsuarios() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [USUARIOS_KEY],
    queryFn:  fetchUsuarios,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Usuario creado correctamente');
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUsuario(id, data),
    onSuccess: (res) => {
      if (res.error) { toast.error(res.error ?? 'Error al actualizar'); return; }
    toast.success('Usuario actualizado');
    queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
  },
  onError: () => toast.error('Error de conexión'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'activo' | 'inactivo' | 'suspendido' }) =>
      toggleEstadoUsuario(id, estado),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error'); return; }
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al eliminar'); return; }
      toast.success('Usuario eliminado');
      queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    usuarios:  query.data ?? [],
    isLoading: query.isLoading,
    refetch:   query.refetch,

    create:       (data: any)                                        => createMutation.mutate(data),
    update:       (id: string, data: any)                           => updateMutation.mutate({ id, data }),
    toggleEstado: (id: string, estado: 'activo' | 'inactivo' | 'suspendido') =>
      toggleMutation.mutate({ id, estado }),
    remove:       (id: string)                                      => deleteMutation.mutate(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: [USUARIOS_KEY, id],
    queryFn:  () => fetchUsuarioById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}
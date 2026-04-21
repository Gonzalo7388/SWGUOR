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

// Definimos una interfaz rápida para las respuestas de la API
interface MutationResponse {
  success?: boolean;
  error?: string;
  data?: any;
}

export function useUsuarios() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [USUARIOS_KEY],
    queryFn: fetchUsuarios,
  });

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: (res: MutationResponse) => { // Especificamos el tipo aquí
      if (!res.success) {
        toast.error(res.error || 'Error al crear');
      } else {
        toast.success('Usuario creado correctamente');
        queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      }
    },
    onError: (err: any) => toast.error(err.message || 'Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUsuario(id, data),
    onSuccess: (res: any) => { // Usamos any temporalmente para evitar el error de 'never'
      if (res?.error) {
        toast.error(typeof res.error === 'string' ? res.error : 'Error al actualizar');
      } else {
        toast.success('Usuario actualizado');
        queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
        // Invalidamos específicamente este ID si existe en la respuesta
        const updatedId = res?.data?.[0]?.id || res?.id;
        if (updatedId) {
            queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY, updatedId.toString()] });
        }
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      toggleEstadoUsuario(id, estado),
    onSuccess: (res: MutationResponse) => {
      if (!res.success) {
        toast.error(res.error || 'Error al actualizar estado');
      } else {
        toast.success('Estado actualizado');
        queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUsuario(id), // Aseguramos que reciba el string
    onSuccess: (res: MutationResponse) => {
      if (!res.success) {
        toast.error(res.error || 'Error al eliminar');
      } else {
        toast.success('Usuario eliminado');
        queryClient.invalidateQueries({ queryKey: [USUARIOS_KEY] });
      }
    },
  });

  return {
    usuarios: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,

    create: (data: any) => createMutation.mutate(data),
    update: (id: string, data: any) => updateMutation.mutate({ id, data }),
    toggleEstado: (id: string, estado: string) => toggleMutation.mutate({ id, estado }),
    remove: (id: string) => deleteMutation.mutate(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: [USUARIOS_KEY, id],
    queryFn: () => fetchUsuarioById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchProductos,
  fetchProductoById,
  createProducto,
  updateProducto,
  toggleEstadoProducto,
  deleteProducto,
} from '@/lib/helpers/productos-helpers';

export const PRODUCTOS_KEY = 'productos';

export function useProductos(params?: {
  categoriaId?: string;
  estado?:      string;
  busqueda?:    string;
  color?:       string;
  talla?:       string;
  sortOrder?:   'asc' | 'desc' | 'none';
}) {
  const queryClient = useQueryClient();

  const { categoriaId, estado, busqueda, color, talla, sortOrder } = params ?? {};

  const query = useQuery({
    queryKey: [PRODUCTOS_KEY, { categoriaId, estado, busqueda, color, talla, sortOrder }], 
    queryFn:  () => fetchProductos({ categoriaId, estado, busqueda, color, talla, sortOrder }),
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al crear'); return; }
      toast.success('Producto creado');
      queryClient.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProducto(id, data),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al actualizar'); return; }
      toast.success('Producto actualizado');
      queryClient.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'activo' | 'inactivo' }) =>
      toggleEstadoProducto(id, estado),
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error'); return; }
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: (res) => {
      if (!res.success) { toast.error(res.error ?? 'Error al eliminar'); return; }
      toast.success('Producto eliminado');
      queryClient.invalidateQueries({ queryKey: [PRODUCTOS_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    productos:  (query.data as any)?.productos  ?? [],
    categorias: (query.data as any)?.categorias ?? [],
    isLoading:  query.isLoading,
    refetch:    query.refetch,

    create:       (data: any)                                => createMutation.mutate(data),
    update:       (id: string, data: any)                   => updateMutation.mutate({ id, data }),
    toggleEstado: (id: string, estado: 'activo' | 'inactivo') => toggleMutation.mutate({ id, estado }),
    remove:       (id: string)                              => deleteMutation.mutate(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: [PRODUCTOS_KEY, id],
    queryFn:  () => fetchProductoById(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });
}
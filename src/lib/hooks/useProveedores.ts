'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchProveedores,
  saveProveedor,
  deactivateProveedor,
} from '@/lib/helpers/proveedores-helpers';
import type { ProveedorForm, EstadoProveedor } from '@/lib/schemas/proveedor';

export const PROVEEDORES_KEY = 'proveedores';

interface UseProveedoresOptions {
  page:          number;
  limit:         number;
  busqueda:      string;
  estadoFilter:  EstadoProveedor;
  editingId?:    string | null; // para el mensaje de éxito
}

export function useProveedores({
  page,
  limit,
  busqueda,
  estadoFilter,
  editingId,
}: UseProveedoresOptions) {
  const queryClient = useQueryClient();

  // ── Query ──────────────────────────────────────────────────
  const query = useQuery({
    queryKey: [PROVEEDORES_KEY, page, busqueda, estadoFilter],
    queryFn:  () => fetchProveedores(page, limit, busqueda, estadoFilter),
    refetchOnWindowFocus: false,
  });

  // ── Mutación: guardar (crear / editar) ─────────────────────
  const saveMutation = useMutation({
    mutationFn: saveProveedor,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || 'Error al guardar');
        return;
      }
      toast.success(editingId ? 'Proveedor actualizado' : 'Proveedor creado');
      queryClient.invalidateQueries({ queryKey: [PROVEEDORES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Mutación: desactivar ───────────────────────────────────
  const deactivateMutation = useMutation({
    mutationFn: deactivateProveedor,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || 'Error al desactivar');
        return;
      }
      toast.success(res.message || 'Proveedor desactivado');
      queryClient.invalidateQueries({ queryKey: [PROVEEDORES_KEY] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  return {
    // datos
    proveedores: query.data?.data ?? [],
    pagination:  query.data?.pagination,
    isLoading:   query.isLoading,
    refetch:     query.refetch,

    // acciones
    save:       (data: ProveedorForm) => saveMutation.mutate(data),
    deactivate: (id: string)          => deactivateMutation.mutate(id),

    // estados de mutación
    isSaving:      saveMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
  };
}
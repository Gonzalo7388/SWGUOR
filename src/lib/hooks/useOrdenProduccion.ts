'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createOrdenProduccion } from '@/lib/helpers/ordenes-produccion-helpers';

// 1. Definimos la interfaz estricta con las propiedades exactas que tu helper exige
export interface CreateOrdenProduccionInput {
  producto_id:         string | number;
  taller_id:           string | number;
  ficha_id:            string | number;
  cantidad_solicitada: number;
  fecha_entrega?:      string;
  notas?:              string;
}

interface ApiResponse<T = unknown> {
  success:  boolean;
  error?:   string | null;
  message?: string | null;
  data?:    T;
}

export const ORDENES_KEY = 'ordenes-produccion';

export function useCreateOrdenProduccion() {
  const queryClient = useQueryClient();

  const createMutation = useMutation<ApiResponse<unknown>, Error, CreateOrdenProduccionInput>({
    mutationFn: createOrdenProduccion,
    onSuccess: (res) => {
      if (!res.success) { 
        toast.error(res.error ?? 'Error al crear la orden'); 
        return; 
      }
      toast.success('Orden de producción creada correctamente');
      queryClient.invalidateQueries({ queryKey: [ORDENES_KEY] });
    },
    onError: () => toast.error('Error de conexión con el servidor'),
  });

  return {
    // Tipamos también el argumento de la función expuesta para mantener el autocompletado en los formularios
    create: (data: CreateOrdenProduccionInput) => createMutation.mutate(data),
    isCreating: createMutation.isPending,
  };
}
import { z } from 'zod';

export const almacenSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  ubicacion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  capacidad_maxima: z.number().int().positive().optional(),
  estado: z.enum(['activo', 'inactivo'] as const, {
    error: 'Estado inválido',
  }).default('activo'),
});

export const almacenUpdateSchema = almacenSchema.partial();

export type AlmacenInput = z.infer<typeof almacenSchema>;
export type AlmacenUpdate = z.infer<typeof almacenUpdateSchema>;
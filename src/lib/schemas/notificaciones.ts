import { z } from 'zod';

export const notificacionSchema = z.object({
  usuario_id: z.number().int().positive('Usuario requerido'),
  titulo: z.string().min(1, 'Título requerido').max(100, 'Máximo 100 caracteres'),
  mensaje: z.string().min(1, 'Mensaje requerido').max(500, 'Máximo 500 caracteres'),
  tipo: z.enum(['info', 'warning', 'error', 'success'] as const, {
    error: 'Tipo inválido',
  }),
  leida: z.boolean().default(false),
});

export const notificacionUpdateSchema = notificacionSchema.partial();

export type NotificacionInput = z.infer<typeof notificacionSchema>;
export type NotificacionUpdate = z.infer<typeof notificacionUpdateSchema>;
import { z } from 'zod';

export const auditoriaQuerySchema = z.object({
  usuario_id: z.string().optional(),
  tabla: z.string().optional(),
  accion: z.enum(['crear', 'actualizar', 'eliminar', 'aprobar', 'rechazar', 'anular']).optional(),
  desde: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }).optional(),
  hasta: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }).optional(),
});

export type AuditoriaQuery = z.infer<typeof auditoriaQuerySchema>;
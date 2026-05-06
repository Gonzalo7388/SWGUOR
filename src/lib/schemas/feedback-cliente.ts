import { z } from 'zod';

export const feedbackClienteSchema = z.object({
  cliente_id: z.number().int().positive(),
  pedido_id:  z.number().int().positive(),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
  tipo_feedback: z.enum(['positivo', 'negativo', 'sugerencia']),
});

export const feedbackClienteUpdateSchema = feedbackClienteSchema.partial();

export type FeedbackClienteInput = z.infer<typeof feedbackClienteSchema>;
export type FeedbackClienteUpdate = z.infer<typeof feedbackClienteUpdateSchema>;
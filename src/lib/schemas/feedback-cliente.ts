import { z } from 'zod';

export const feedbackClienteSchema = z.object({
  cliente_id: z.number().int().positive(),
  pedido_id:  z.number().int().positive(),
  puntuacion: z.number().int().min(1).max(5),
  comentarios: z.string().max(500).optional(),
  calidad_producto: z.number().int().min(1).max(5).optional(),
  tiempo_entrega: z.number().int().min(1).max(5).optional(),
  atencion_personal: z.number().int().min(1).max(5).optional(),
  recomendaria: z.boolean().optional(),
});

export const feedbackClienteUpdateSchema = feedbackClienteSchema.partial();

export type FeedbackClienteInput = z.infer<typeof feedbackClienteSchema>;
export type FeedbackClienteUpdate = z.infer<typeof feedbackClienteUpdateSchema>;
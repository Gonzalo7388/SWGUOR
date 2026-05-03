import { z } from 'zod';

export const tarifasTallerSchema = z.object({
  taller_id: z.number().int().positive(),
  especialidad: z.enum(['corte', 'confeccion', 'bordado', 'estampado', 'costura', 'acabados', 'otro']),
  precio_unitario: z.number().positive(),
  moneda: z.string().min(3).max(3).default('PEN'),
  vigente_desde: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }),
  vigente_hasta: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }).optional(),
  activo: z.boolean().default(true),
  notas: z.string().max(500).optional(),
});

export const tarifasTallerUpdateSchema = tarifasTallerSchema.partial();

export type TarifasTallerInput = z.infer<typeof tarifasTallerSchema>;
export type TarifasTallerUpdate = z.infer<typeof tarifasTallerUpdateSchema>;
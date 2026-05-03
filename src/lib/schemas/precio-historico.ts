import { z } from 'zod';

export const precioHistoricoSchema = z.object({
  producto_id: z.number().int().positive(),
  precio: z.number().positive(),
  motivo: z.string().max(250).optional(),
  vigente_desde: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Fecha inválida',
  }),
  vigente_hasta: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Fecha inválida',
  }).optional(),
  creado_por: z.number().int().positive().optional(),
});

export const precioHistoricoUpdateSchema = precioHistoricoSchema.partial();

export type PrecioHistoricoInput = z.infer<typeof precioHistoricoSchema>;
export type PrecioHistoricoUpdate = z.infer<typeof precioHistoricoUpdateSchema>;
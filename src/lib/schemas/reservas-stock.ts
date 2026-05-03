import { z } from 'zod';

export const reservasStockSchema = z.object({
  variante_id: z.number().int().positive(),
  cotizacion_id: z.number().int().positive().optional(),
  pedido_id: z.number().int().positive().optional(),
  cantidad: z.number().int().positive(),
  expira_en: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }).optional(),
  estado: z.string().min(1).max(50).default('activa'),
});

export const reservasStockUpdateSchema = reservasStockSchema.partial();

export type ReservasStockInput = z.infer<typeof reservasStockSchema>;
export type ReservasStockUpdate = z.infer<typeof reservasStockUpdateSchema>;
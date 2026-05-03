import { z } from 'zod';

export const pagosTallerSchema = z.object({
  taller_id: z.number().int().positive(),
  confeccion_id: z.number().int().positive().optional(),
  orden_produccion_id: z.number().int().positive().optional(),
  monto: z.number().positive(),
  moneda: z.string().min(3).max(3).default('PEN'),
  metodo_pago: z.enum(['efectivo', 'transferencia_bcp', 'yape', 'plin', 'visa', 'mastercard']),
  estado: z.enum(['pendiente', 'pagado', 'anulado']).default('pendiente'),
  fecha_pago: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }),
  numero_operacion: z.string().max(100).optional(),
  comprobante_url: z.string().url().optional(),
  notas: z.string().max(500).optional(),
  registrado_por: z.number().int().positive().optional(),
});

export const pagosTallerUpdateSchema = pagosTallerSchema.partial();

export type PagosTallerInput = z.infer<typeof pagosTallerSchema>;
export type PagosTallerUpdate = z.infer<typeof pagosTallerUpdateSchema>;
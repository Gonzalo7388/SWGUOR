import { z } from 'zod';

export const MetodoPagoEnum = z.enum([
  'efectivo',
  'transferencia_bcp',
  'yape',
  'plin',
  'visa',
  'mastercard',
]);

export const EstadoPagoTallerEnum = z.enum(['pendiente', 'pagado', 'anulado']);

export const pagoTallerBaseSchema = z.object({
  id: z.number().int().positive(),
  taller_id: z.number().int().positive(),
  confeccion_id: z.number().int().positive().nullable().optional(),
  orden_produccion_id: z.number().int().positive().nullable().optional(),
  monto: z.number().positive(),
  moneda: z.string().max(3).default('PEN'),
  metodo_pago: MetodoPagoEnum,
  estado: EstadoPagoTallerEnum.default('pendiente'),
  fecha_pago: z.date(),
  numero_operacion: z.string().nullable().optional(),
  comprobante_url: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  registrado_por: z.number().int().positive().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const crearPagoTallerSchema = pagoTallerBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  estado: true,
});

export const registrarPagoSchema = z.object({
  pagoTallerId: z.number().int().positive(),
  numero_operacion: z.string().optional(),
  comprobante_url: z.string().optional(),
  notas: z.string().optional(),
});

export const obtenerPagosTallerSchema = z.object({
  filtro: z
    .object({
      taller_id: z.number().int().positive().optional(),
      confeccion_id: z.number().int().positive().optional(),
      orden_produccion_id: z.number().int().positive().optional(),
      estado: EstadoPagoTallerEnum.optional(),
      metodo_pago: MetodoPagoEnum.optional(),
      desde: z.date().optional(),
      hasta: z.date().optional(),
    })
    .optional(),
  paginacion: z
    .object({
      pagina: z.number().int().positive().default(1),
      limite: z.number().int().positive().default(20),
    })
    .optional(),
});

export type MetodoPago = z.infer<typeof MetodoPagoEnum>;
export type EstadoPagoTaller = z.infer<typeof EstadoPagoTallerEnum>;
export type PagoTaller = z.infer<typeof pagoTallerBaseSchema>;
export type CrearPagoTaller = z.infer<typeof crearPagoTallerSchema>;
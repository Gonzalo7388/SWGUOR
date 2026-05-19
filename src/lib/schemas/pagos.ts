import { z } from 'zod';

export const MetodoPagoEnum = z.enum([
  'efectivo',
  'transferencia_bcp',
  'yape',
  'plin',
  'visa',
  'mastercard',
]);

export const TipoPagoEnum = z.enum([
  'adelanto',
  'cuota',
  'saldo_final',
  'pago_completo',
]);

export const EstadoPagoEnum = z.enum(['pendiente', 'verificado', 'rechazado']);

export const pagoBaseSchema = z.object({
  id: z.number().int().positive(),
  pedido_id: z.number().int().positive(),
  monto: z.number().positive(),
  metodo_pago: MetodoPagoEnum,
  fecha_pago: z.date(),
  comprobante_url: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  usuario_id: z.number().int().positive().nullable().optional(),
  tipo: TipoPagoEnum.default('pago_completo'),
  estado: EstadoPagoEnum.default('pendiente'),
  verificado_at: z.date().nullable().optional(),
  verificado_por: z.number().int().positive().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date().nullable().optional(),
});

export const crearPagoSchema = pagoBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  estado: true,
  verificado_at: true,
  verificado_por: true,
});

export const verificarPagoSchema = z.object({
  pagoId: z.number().int().positive(),
  verificado_por: z.number().int().positive(),
  notas: z.string().max(500).optional(),
});

export const rechazarPagoSchema = z.object({
  pagoId: z.number().int().positive(),
  motivo: z.string().min(10).max(500),
});

export const obtenerPagosSchema = z.object({
  filtro: z
    .object({
      pedido_id: z.number().int().positive().optional(),
      estado: EstadoPagoEnum.optional(),
      tipo: TipoPagoEnum.optional(),
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

export const reportePagosSchema = z.object({
  desde: z.date(),
  hasta: z.date(),
  metodo_pago: MetodoPagoEnum.optional(),
  agrupar_por: z.enum(['fecha', 'metodo_pago', 'estado', 'tipo']).optional(),
});

export type MetodoPago = z.infer<typeof MetodoPagoEnum>;
export type TipoPago = z.infer<typeof TipoPagoEnum>;
export type EstadoPago = z.infer<typeof EstadoPagoEnum>;
export type Pago = z.infer<typeof pagoBaseSchema>;
export type CrearPago = z.infer<typeof crearPagoSchema>;
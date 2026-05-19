import { z } from 'zod';

export const TipoComprobanteEnum = z.enum([
  'factura',
  'boleta',
  'nota_credito',
  'nota_debito',
]);

export const EstadoComprobanteEnum = z.enum([
  'pendiente',
  'enviado',
  'aceptado',
  'rechazado',
]);

export const comprobanteBaseSchema = z.object({
  id: z.number().int().positive(),
  pedido_id: z.number().int().positive().nullable().optional(),
  pago_id: z.number().int().positive().nullable().optional(),
  tipo: TipoComprobanteEnum,
  serie: z.string().min(1).max(255),
  correlativo: z.string().min(1).max(255),
  numero_completo: z.string().nullable().optional(),
  subtotal: z.number().nonnegative().default(0),
  igv: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  moneda: z.string().max(3).default('PEN'),
  ruc_emisor: z.string().max(11),
  hash_cpe: z.string().nullable().optional(),
  cdr_url: z.string().nullable().optional(),
  xml_url: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  estado_sunat: EstadoComprobanteEnum.default('pendiente'),
  enviado_sunat_at: z.date().nullable().optional(),
  respuesta_sunat: z.string().nullable().optional(),
  fecha_emision: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const crearComprobanteSchema = comprobanteBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  numero_completo: true,
  estado_sunat: true,
  hash_cpe: true,
  cdr_url: true,
  xml_url: true,
  enviado_sunat_at: true,
  respuesta_sunat: true,
});

export const anularComprobanteSchema = z.object({
  comprobanteId: z.number().int().positive(),
  motivo: z.string().min(10).max(500),
});

export const enviarComprobanteSchema = z.object({
  comprobanteId: z.number().int().positive(),
  emailDestino: z.string().email(),
});

export const obtenerComprobantesSchema = z.object({
  filtro: z
    .object({
      pedido_id: z.number().int().positive().optional(),
      pago_id: z.number().int().positive().optional(),
      tipo: TipoComprobanteEnum.optional(),
      estado_sunat: EstadoComprobanteEnum.optional(),
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

export type TipoComprobante = z.infer<typeof TipoComprobanteEnum>;
export type EstadoComprobante = z.infer<typeof EstadoComprobanteEnum>;
export type Comprobante = z.infer<typeof comprobanteBaseSchema>;
export type CrearComprobante = z.infer<typeof crearComprobanteSchema>;
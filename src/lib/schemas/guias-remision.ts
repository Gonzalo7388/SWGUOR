import { z } from 'zod';

export const TipoGuiaRemisionEnum = z.enum([
  'envio_taller',
  'retorno_taller',
  'despacho_cliente',
  'devolucion_cliente',
  'traslado_almacen',
]);

export const EstadoGuiaRemisionEnum = z.enum([
  'borrador',
  'emitida',
  'en_transito',
  'entregada',
  'anulada',
]);

export const guiaRemisionBaseSchema = z.object({
  id: z.number().int().positive(),
  numero: z.string().min(1).max(255),
  tipo: TipoGuiaRemisionEnum,
  estado: EstadoGuiaRemisionEnum.default('borrador'),
  origen_tipo: z.string().min(1).max(255),
  origen_id: z.number().int().positive().nullable().optional(),
  origen_direccion: z.string().min(1).max(255),
  destino_tipo: z.string().min(1).max(255),
  destino_id: z.number().int().positive().nullable().optional(),
  destino_direccion: z.string().min(1).max(255),
  pedido_id: z.number().int().positive().nullable().optional(),
  orden_produccion_id: z.number().int().positive().nullable().optional(),
  transportista: z.string().nullable().optional(),
  ruc_transportista: z.string().max(11).nullable().optional(),
  placa_vehiculo: z.string().nullable().optional(),
  fecha_emision: z.date(),
  fecha_traslado: z.date(),
  fecha_entrega: z.date().nullable().optional(),
  motivo_traslado: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  emitido_por: z.number().int().positive().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const crearGuiaRemisionSchema = guiaRemisionBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  numero: true,
  estado: true,
  fecha_entrega: true,
});

export const entregarGuiaSchema = z.object({
  guiaId: z.number().int().positive(),
  observacionesEntrega: z.string().max(500).optional(),
});

export const obtenerGuiasSchema = z.object({
  filtro: z
    .object({
      origen_tipo: z.string().optional(),
      destino_tipo: z.string().optional(),
      pedido_id: z.number().int().positive().optional(),
      orden_produccion_id: z.number().int().positive().optional(),
      estado: EstadoGuiaRemisionEnum.optional(),
      tipo: TipoGuiaRemisionEnum.optional(),
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

export type TipoGuiaRemision = z.infer<typeof TipoGuiaRemisionEnum>;
export type EstadoGuiaRemision = z.infer<typeof EstadoGuiaRemisionEnum>;
export type GuiaRemision = z.infer<typeof guiaRemisionBaseSchema>;
export type CrearGuiaRemision = z.infer<typeof crearGuiaRemisionSchema>;
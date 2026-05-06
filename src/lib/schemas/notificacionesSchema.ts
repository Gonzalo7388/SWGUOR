import { z } from 'zod';

export const TipoNotificacionEnum = z.enum([
  'stock_bajo',
  'pedido_vencido',
  'pago_pendiente',
  'cotizacion_expirada',
  'orden_produccion',
  'confeccion_completada',
  'devolucion_solicitada',
  'sistema',
]);

export const notificacionBaseSchema = z.object({
  id: z.number().int().positive(),
  usuario_id: z.number().int().positive(),
  tipo: TipoNotificacionEnum,
  titulo: z.string().min(1).max(255),
  mensaje: z.string().min(1),
  leido: z.boolean().default(false),
  leido_at: z.date().nullable().optional(),
  referencia_tipo: z.string().nullable().optional(),
  referencia_id: z.number().int().positive().nullable().optional(),
  url_destino: z.string().nullable().optional(),
  created_at: z.date(),
});

export const crearNotificacionSchema = notificacionBaseSchema.omit({
  id: true,
  created_at: true,
  leido: true,
  leido_at: true,
});

export const actualizarNotificacionSchema = crearNotificacionSchema.partial();

export const marcarComoLeidaSchema = z.object({
  notificacionId: z.number().int().positive(),
});

export const obtenerNotificacionesSchema = z.object({
  usuario_id: z.number().int().positive(),
  filtro: z
    .object({
      leido: z.boolean().optional(),
      tipo: TipoNotificacionEnum.optional(),
      referencia_tipo: z.string().optional(),
    })
    .optional(),
  paginacion: z
    .object({
      pagina: z.number().int().positive().default(1),
      limite: z.number().int().positive().default(20),
    })
    .optional(),
});

export type TipoNotificacion = z.infer<typeof TipoNotificacionEnum>;
export type Notificacion = z.infer<typeof notificacionBaseSchema>;
export type CrearNotificacion = z.infer<typeof crearNotificacionSchema>;
export type ActualizarNotificacion = z.infer<typeof actualizarNotificacionSchema>;
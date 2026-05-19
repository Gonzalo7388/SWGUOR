import { z } from 'zod';

export const reservaStockBaseSchema = z.object({
  id: z.string().uuid(),
  variante_id: z.number().int().positive(),
  cotizacion_id: z.number().int().positive().nullable().optional(),
  pedido_id: z.number().int().positive().nullable().optional(),
  cantidad: z.number().int().positive(),
  expira_en: z.date().nullable().optional(),
  estado: z.enum(['activa', 'utilizada', 'cancelada']).default('activa'),
  created_at: z.date(),
  updated_at: z.date(),
});

export const crearReservaSchema = reservaStockBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  estado: true,
});

export const actualizarReservaSchema = crearReservaSchema.partial();

export const obtenerReservasSchema = z.object({
  filtro: z.object({
    variante_id: z.number().int().positive().optional(),
    estado: z.enum(['activa', 'utilizada', 'cancelada']).optional(),
  }).optional(),
  paginacion: z.object({
    pagina: z.number().int().positive().default(1),
    limite: z.number().int().positive().default(20),
  }).optional(),
});

export const utilizarReservaSchema = z.object({
  reservaId: z.string().uuid(),
  cantidadUtilizada: z.number().int().positive(),
});

export const cancelarReservaSchema = z.object({
  reservaId: z.string().uuid(),
  motivoCancelacion: z.string().min(5).max(500),
});

export type ReservaStock = z.infer<typeof reservaStockBaseSchema>;
export type CrearReserva = z.infer<typeof crearReservaSchema>;
export type ActualizarReserva = z.infer<typeof actualizarReservaSchema>;

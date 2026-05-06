import { z } from 'zod';

export const reservaStockBaseSchema = z.object({
  id: z.string().uuid(),
  productoId: z.string().uuid(),
  almacenId: z.string().uuid(),
  cantidadReservada: z.number().int().positive(),
  cantidadDisponible: z.number().int().nonnegative(),
  pedidoId: z.string().uuid().nullable().optional(),
  ordenCompraId: z.string().uuid().nullable().optional(),
  motivo: z.enum(['VENTA', 'PRODUCCION', 'MANTENIMIENTO', 'MUESTRA']),
  estatus: z.enum(['ACTIVA', 'PARCIAL_UTILIZADA', 'UTILIZADA', 'CANCELADA']),
  fechaExpiracion: z.date().nullable().optional(),
  fechaUso: z.date().nullable().optional(),
  notas: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const crearReservaSchema = reservaStockBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  estatus: true,
});

export const actualizarReservaSchema = crearReservaSchema.partial();

export const obtenerReservasSchema = z.object({
  filtro: z.object({
    almacenId: z.string().uuid().optional(),
    productoId: z.string().uuid().optional(),
    estatus: z.enum(['ACTIVA', 'PARCIAL_UTILIZADA', 'UTILIZADA', 'CANCELADA']).optional(),
    motivo: z.enum(['VENTA', 'PRODUCCION', 'MANTENIMIENTO', 'MUESTRA']).optional(),
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

import { z } from 'zod';

// Prisma: ordenes_compra { id BigInt, cotizacion_proveedor_id BigInt?,
// proveedor_id BigInt, creado_por String? @db.Uuid,
// estado EstadoOrdenCompra @default(pendiente),
// estado_pago EstadoPagoOrdenCompra @default(pendiente),
// total_orden Decimal(12,2) @default(0), total_pagado Decimal(12,2) @default(0),
// saldo_pendiente Decimal(12,2)? (computed), fecha_prometida Date?,
// fecha_recepcion Date?, notas String?, created_at?, updated_at? }

// EstadoOrdenCompra enum: pendiente | confirmada | parcialmente_recibida | completada | cancelada
// EstadoPagoOrdenCompra enum: pendiente | parcial | pagado

export const EstadoOrdenCompraEnum = z.enum([
  'pendiente',
  'confirmada',
  'parcialmente_recibida',
  'completada',
  'cancelada',
]);

export const EstadoPagoOrdenCompraEnum = z.enum(['pendiente', 'parcial', 'pagado']);

export const ordenCompraBaseSchema = z.object({
  id: z.number().int().positive(),
  cotizacion_proveedor_id: z.number().int().positive().nullable().optional(),
  proveedor_id: z.number().int().positive(),
  creado_por: z.string().uuid().nullable().optional(),
  estado: EstadoOrdenCompraEnum.default('pendiente'),
  estado_pago: EstadoPagoOrdenCompraEnum.default('pendiente'),
  total_orden: z.number().nonnegative().default(0),
  total_pagado: z.number().nonnegative().default(0),
  saldo_pendiente: z.number().nullable().optional(),
  fecha_prometida: z.date().nullable().optional(),
  fecha_recepcion: z.date().nullable().optional(),
  notas: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional(),
});

export const crearOrdenCompraSchema = ordenCompraBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  saldo_pendiente: true,
  total_pagado: true,
  estado: true,
  estado_pago: true,
});

export const actualizarOrdenCompraSchema = crearOrdenCompraSchema.partial();

export const aprobarOrdenCompraSchema = z.object({
  ordenId: z.number().int().positive(),
  observaciones: z.string().max(500).optional(),
});

export const recibirOrdenCompraSchema = z.object({
  ordenId: z.number().int().positive(),
  fecha_recepcion: z.date(),
  observacionesRecepcion: z.string().max(500).optional(),
});

export const obtenerOrdenesSchema = z.object({
  filtro: z
    .object({
      proveedor_id: z.number().int().positive().optional(),
      estado: EstadoOrdenCompraEnum.optional(),
      estado_pago: EstadoPagoOrdenCompraEnum.optional(),
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

export type EstadoOrdenCompra = z.infer<typeof EstadoOrdenCompraEnum>;
export type EstadoPagoOrdenCompra = z.infer<typeof EstadoPagoOrdenCompraEnum>;
export type OrdenCompra = z.infer<typeof ordenCompraBaseSchema>;
export type CrearOrdenCompra = z.infer<typeof crearOrdenCompraSchema>;
export type ActualizarOrdenCompra = z.infer<typeof actualizarOrdenCompraSchema>;
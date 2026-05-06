import { z } from 'zod';

export const precioHistoricoBaseSchema = z.object({
  id: z.number().int().positive(),
  producto_id: z.number().int().positive(),
  precio: z.number().positive().multipleOf(0.01),
  moneda: z.enum(['PEN', 'USD']).default('PEN'),
  tipoProducto: z.enum(['MATERIA_PRIMA', 'CONFECCIONADO']),
  fechaVigencia: z.date(),
  razonCambio: z.enum(['AJUSTE_MERCADO', 'PROMOCION', 'COSTO_MATERIA_PRIMA', 'ESTACIONALIDAD', 'OTRO']),
  porcentajeCambio: z.number(),
  creadoPor: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const crearPrecioHistoricoSchema = precioHistoricoBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  porcentajeCambio: true,
});

export const obtenerHistoricoSchema = z.object({
  productoId: z.string().uuid(),
  desde: z.date().optional(),
  hasta: z.date().optional(),
});

export const reportePreciosSchema = z.object({
  categoriaProducto: z.string().optional(),
  periodo: z.object({
    desde: z.date(),
    hasta: z.date(),
  }).optional(),
});

export type PrecioHistorico = z.infer<typeof precioHistoricoBaseSchema>;
export type CrearPrecioHistorico = z.infer<typeof crearPrecioHistoricoSchema>;

import { z } from 'zod';

export const tarifaTallerBaseSchema = z.object({
  id: z.string().uuid(),
  tallerId: z.string().uuid(),
  nombreServicio: z.string().min(3).max(150),
  descripcion: z.string().max(500).optional(),
  tipoServicio: z.enum(['CONFECCION', 'DISEÑO', 'ACABADO', 'ESTAMPADO', 'BORDADO', 'OTRO']),
  precioUnitario: z.number().positive(),
  unidadMedida: z.enum(['PIEZA', 'METRO', 'HORA', 'DOCENA']),
  moneda: z.enum(['PEN', 'USD']).default('PEN'),
  tiempoEstimado: z.number().int().positive().optional(),
  unidadTiempo: z.enum(['MINUTOS', 'HORAS', 'DIAS']).optional(),
  vigenciaDesde: z.date(),
  vigenciaHasta: z.date().nullable().optional(),
  activo: z.boolean().default(true),
  observaciones: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const crearTarifaTallerSchema = tarifaTallerBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const actualizarTarifaTallerSchema = crearTarifaTallerSchema.partial();

export const obtenerTarifasSchema = z.object({
  filtro: z.object({
    tallerId: z.string().uuid().optional(),
    tipoServicio: z.enum(['CONFECCION', 'DISEÑO', 'ACABADO', 'ESTAMPADO', 'BORDADO', 'OTRO']).optional(),
    activo: z.boolean().optional(),
  }).optional(),
  paginacion: z.object({
    pagina: z.number().int().positive().default(1),
    limite: z.number().int().positive().default(20),
  }).optional(),
});

export const calcularCostoServicioSchema = z.object({
  tarifaTallerId: z.string().uuid(),
  cantidad: z.number().positive(),
});

export type TarifaTaller = z.infer<typeof tarifaTallerBaseSchema>;
export type CrearTarifaTaller = z.infer<typeof crearTarifaTallerSchema>;
export type ActualizarTarifaTaller = z.infer<typeof actualizarTarifaTallerSchema>;

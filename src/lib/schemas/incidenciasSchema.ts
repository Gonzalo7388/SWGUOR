import { z } from 'zod';

// Prisma: incidencias { id BigInt, pedido_id BigInt, confeccion_id BigInt?,
// tipo TipoIncidencia, severidad SeveridadIncidencia @default(media),
// descripcion String, reportado_por BigInt?, asignado_a BigInt?,
// fecha_reporte DateTime @default(now()), fecha_resolucion DateTime?,
// resuelto Boolean @default(false), solucion String?,
// impacto_horas Float?, foto_url String? @db.VarChar(500),
// created_at, updated_at? }

// TipoIncidencia enum: averia_maquina | falta_material | error_diseno |
//   defecto_corte | defecto_confeccion | retraso | otro
// SeveridadIncidencia enum: baja | media | alta | critica

export const TipoIncidenciaEnum = z.enum([
  'averia_maquina',
  'falta_material',
  'error_diseno',
  'defecto_corte',
  'defecto_confeccion',
  'retraso',
  'otro',
]);

export const SeveridadIncidenciaEnum = z.enum(['baja', 'media', 'alta', 'critica']);

export const incidenciaBaseSchema = z.object({
  id: z.number().int().positive(),
  pedido_id: z.number().int().positive(),
  confeccion_id: z.number().int().positive().nullable().optional(),
  tipo: TipoIncidenciaEnum,
  severidad: SeveridadIncidenciaEnum.default('media'),
  descripcion: z.string().min(1),
  reportado_por: z.number().int().positive().nullable().optional(),
  asignado_a: z.number().int().positive().nullable().optional(),
  fecha_reporte: z.date(),
  fecha_resolucion: z.date().nullable().optional(),
  resuelto: z.boolean().default(false),
  solucion: z.string().nullable().optional(),
  impacto_horas: z.number().nullable().optional(),
  foto_url: z.string().max(500).nullable().optional(),
  created_at: z.date(),
  updated_at: z.date().nullable().optional(),
});

export const crearIncidenciaSchema = incidenciaBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  fecha_resolucion: true,
  solucion: true,
  resuelto: true,
});

export const resolverIncidenciaSchema = z.object({
  incidenciaId: z.number().int().positive(),
  solucion: z.string().min(1).max(2000),
  impacto_horas: z.number().nonnegative().optional(),
});

export const obtenerIncidenciasSchema = z.object({
  filtro: z
    .object({
      tipo: TipoIncidenciaEnum.optional(),
      severidad: SeveridadIncidenciaEnum.optional(),
      resuelto: z.boolean().optional(),
      reportado_por: z.number().int().positive().optional(),
      asignado_a: z.number().int().positive().optional(),
      pedido_id: z.number().int().positive().optional(),
    })
    .optional(),
  paginacion: z
    .object({
      pagina: z.number().int().positive().default(1),
      limite: z.number().int().positive().default(20),
    })
    .optional(),
});

export type TipoIncidencia = z.infer<typeof TipoIncidenciaEnum>;
export type SeveridadIncidencia = z.infer<typeof SeveridadIncidenciaEnum>;
export type Incidencia = z.infer<typeof incidenciaBaseSchema>;
export type CrearIncidencia = z.infer<typeof crearIncidenciaSchema>;
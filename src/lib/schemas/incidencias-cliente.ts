import { z } from 'zod';

// ─── Enums como literales Zod ────────────────────────────────────────────────
export const tipoIncidenciaSchema = z.enum([
  'defecto_confeccion',
  'pedido_equivocado',
  'talla_incorrecta',
  'cantidad_incorrecta',
  'dano_en_transporte',
  'empaque_defectuoso',
  'otro',
]);

export const severidadSchema = z.enum(['baja', 'media', 'alta', 'critica']);

// ─── Schema del formulario (client-side) ─────────────────────────────────────
export const incidenciaFormSchema = z.object({
  tipo: tipoIncidenciaSchema,
  severidad: severidadSchema,
  descripcion: z
    .string()
    .min(10, 'Describe el problema con al menos 10 caracteres.')
    .max(1000, 'Máximo 1000 caracteres.'),
  foto: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'La foto no debe superar 5 MB.')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Solo se aceptan imágenes JPG, PNG o WEBP.',
    )
    .optional()
    .nullable(),
});

export type IncidenciaFormValues = z.infer<typeof incidenciaFormSchema>;

// ─── Schema del payload hacia Supabase (server) ───────────────────────────────
export const createIncidenciaSchema = z.object({
  pedido_id: z.number().int().positive(),
  tipo: tipoIncidenciaSchema,
  severidad: severidadSchema,
  descripcion: z.string().min(10).max(1000),
  evidencia_url: z.array(z.string().url()).default([]),
});

export type CreateIncidenciaInput = z.infer<typeof createIncidenciaSchema>;

// ─── Schema para validar update de tracking (posición GPS) ───────────────────
export const updatePosicionSchema = z.object({
  despacho_id: z.number().int().positive(),
  pos_actual_lat: z.number().min(-90).max(90),
  pos_actual_lng: z.number().min(-180).max(180),
  distancia_km: z.number().nonnegative().optional(),
  tiempo_min: z.number().int().nonnegative().optional(),
});

export type UpdatePosicionInput = z.infer<typeof updatePosicionSchema>;
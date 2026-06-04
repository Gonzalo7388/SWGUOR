import { z } from 'zod';

export const cotizacionExtraccionItemSchema = z.object({
  descripcion: z.string().nullable().optional(),
  cantidad: z.coerce.number().nonnegative().optional().default(0),
  unidad: z.string().nullable().optional(),
  precio_unitario: z.coerce.number().nonnegative().optional().default(0),
  subtotal: z.coerce.number().nonnegative().optional().default(0),
  tipo_item: z.enum(['insumo', 'material']).nullable().optional(),
  precio_incluye_igv: z.boolean().nullable().optional(),
  sujeto_igv: z.boolean().nullable().optional(),
});

export const cotizacionExtraccionIaSchema = z.object({
  proveedor: z
    .object({
      ruc: z.string().nullable().optional(),
      razon_social: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      telefono: z.string().nullable().optional(),
      contacto: z.string().nullable().optional(),
    })
    .optional(),

  cotizacion: z
    .object({
      numero_externo: z.string().nullable().optional(),
      fecha_solicitud: z.string().nullable().optional(),
      fecha_vencimiento: z.string().nullable().optional(),
      fecha_prometida: z.string().nullable().optional(),
      fecha_entrega: z.string().nullable().optional(),
      plazo_entrega_dias: z.coerce.number().int().nonnegative().nullable().optional(),
      moneda: z.string().nullable().optional(),
      precios_incluyen_igv: z.boolean().nullable().optional(),
      sujeto_igv: z.boolean().nullable().optional(),
      documento_exonerado_igv: z.boolean().nullable().optional(),
      total_estimado: z.coerce.number().nonnegative().optional().default(0),
      notas: z.string().nullable().optional(),
    })
    .optional(),

  items: z.array(cotizacionExtraccionItemSchema).optional().default(() => []),
});

export type CotizacionExtraccionIA = z.infer<typeof cotizacionExtraccionIaSchema>;
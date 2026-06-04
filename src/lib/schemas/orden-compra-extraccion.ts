import { z } from 'zod';
import { TIPO_IMPUESTO_OC } from '@/lib/constants/ordenes-compra';

export const ordenCompraItemExtraccionSchema = z.object({
  descripcion: z.string(),
  cantidad: z.number(),
  precio_unitario: z.number(),
  unidad: z.string().nullable().optional(),
  tipo: z.enum(['material', 'insumo']).nullable(),
  ref_id: z.string().nullable(),
  ref_nombre: z.string().nullable(),
  match_score: z.number(),
  sin_match: z.boolean(),
  tipo_impuesto: z.enum([TIPO_IMPUESTO_OC.IGV, TIPO_IMPUESTO_OC.SIN_IGV]).default(TIPO_IMPUESTO_OC.IGV),
});

export const ordenCompraExtraccionSchema = z.object({
  proveedor_id: z.string().nullable(),
  proveedor_nombre: z.string().nullable(),
  proveedor_ruc: z.string().nullable().optional(),
  proveedor_razon_extraida: z.string().nullable().optional(),
  proveedor_ruc_extraido: z.string().nullable().optional(),
  proveedor_match_score: z.number().default(0),
  proveedor_sin_match: z.boolean().default(true),
  fecha_prometida: z.string().nullable().optional(),
  precios_incluyen_igv: z.boolean().nullable().optional(),
  sujeto_igv: z.boolean().nullable().optional(),
  notas: z.string().nullable(),
  items: z.array(ordenCompraItemExtraccionSchema),
});

export type OrdenCompraItemExtraccion = z.infer<typeof ordenCompraItemExtraccionSchema>;
export type OrdenCompraExtraccion = z.infer<typeof ordenCompraExtraccionSchema>;

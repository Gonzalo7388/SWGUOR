import { z } from "zod";

export const fichaDetalleItemSchema = z.object({
  id: z.string().optional(),
  ficha_id: z.string().or(z.number()).optional(),
  
  material_id: z.string().or(z.number()).nullable().optional(),
  insumo_id: z.string().or(z.number()).nullable().optional(),
  
  cantidad_consumo: z
    .number({ message: "La cantidad debe ser un número" })
    .min(0.0001, "La cantidad debe ser mayor a 0"),

  
  porcentaje_desperdicio: z.number().min(0).max(100).default(0),
  observaciones: z.string().max(500, "Máximo 500 caracteres").nullable().optional(),
}).refine(data => (data.material_id && !data.insumo_id) || (!data.material_id && data.insumo_id), {
  message: "Debe seleccionar un Material o un Insumo, pero no ambos.",
  path: ["material_id"], 
});

export const fichaDetalleSchema = z.array(fichaDetalleItemSchema);

export type FichaDetalleItem = z.infer<typeof fichaDetalleItemSchema>;

// Interfaz para el tipado de los datos que vienen del servidor (incluyendo el join de Prisma)
export interface FichaDetalleWithRelations extends FichaDetalleItem {
  material?: {
    id: string;
    nombre: string;
    tipo: string;
    composicion?: string;
    color?: string;
    unidad_medida: string;
    precio_unitario: number;
  };
  insumo?: {
    id: string;
    nombre: string;
    tipo: string;
    unidad_medida: string;
    precio_unitario: number;
  };
}
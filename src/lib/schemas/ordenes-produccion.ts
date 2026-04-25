import { z } from "zod";

export const ESTADO_ORDEN_PRODUCCION = [
  "pendiente",
  "enviada",
  "en_proceso",
  "completada",
  "rechazada",
] as const;

export const ETAPA_PRODUCCION = [
  "corte",
  "costura",
  "bordado",
  "acabado",
  "control_calidad",
  "entrega",
] as const;

export const ordenProduccionSchema = z.object({
  producto_id:         z.number().min(1, "Producto requerido"),
  taller_id:           z.number().min(1, "Taller requerido"),
  ficha_id:            z.number().min(1, "Ficha técnica requerida"),
  pedido_id:           z.number().min(1, "Pedido requeirod"),
  cantidad_solicitada: z.number().min(1, "Mínimo 1 unidad"),
  fecha_entrega:       z.string().optional(),
  notas:               z.string().optional(),
});

export type OrdenProduccionFormValues = z.infer<typeof ordenProduccionSchema>;

export const ESTADO_ORDEN_LABELS: Record<typeof ESTADO_ORDEN_PRODUCCION[number], string> = {
  pendiente:  "Pendiente",
  enviada:    "Enviada",
  en_proceso: "En Proceso",
  completada: "Completada",
  rechazada:  "Rechazada",
};

export const ETAPA_LABELS: Record<typeof ETAPA_PRODUCCION[number], string> = {
  corte:           "Corte",
  costura:         "Costura",
  bordado:         "Bordado",
  acabado:         "Acabado",
  control_calidad: "Control de Calidad",
  entrega:         "Entrega",
};

export interface ApiResponse<T = any> {
  success:  boolean;
  data?:    T;
  error?:   string;
  message?: string;
}
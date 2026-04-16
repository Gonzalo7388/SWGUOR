import { z } from "zod";

// ── Enums reutilizables ──────────────────────────────────────────────────────

export const ESTADO_CONFECCION = [
  "pendiente",
  "en_corte",
  "en_costura",
  "acabados",
  "completado",
  "cancelado",
] as const;

export const PRIORIDAD_CONFECCION = ["baja", "media", "alta", "urgente"] as const;

// ── Schema del formulario (RHF — fecha como string) ──────────────────────────

export const confeccionSchema = z.object({
  pedido_id:     z.number({ message: "Debe asociar un pedido" }).min(1, "Pedido requerido"),
  taller_id:      z.string().min(1, "Debe seleccionar un taller"),
  prenda:         z.string().min(3, "Nombre de prenda requerido"),
  cantidad:       z.number({ message: "Cantidad inválida" }).min(1, "Mínimo 1 unidad"),
  costo_unitario: z.number({ message: "Costo inválido" }).min(0.01, "Debe ser mayor a 0").optional(),
  fecha_entrega:  z
    .string()
    .min(1, "Seleccione una fecha de entrega")
    .refine((v) => !isNaN(Date.parse(v)), { message: "Fecha inválida" }),
  prioridad:      z.enum(PRIORIDAD_CONFECCION),
  estado:         z.enum(ESTADO_CONFECCION),
  notas:          z.string().optional(),
});

export type ConfeccionFormValues = z.infer<typeof confeccionSchema>;

// ── Schema de output (lo que va al backend — convierte fecha a ISO) ──────────

export const confeccionOutputSchema = confeccionSchema.transform((d) => ({
  ...d,
  taller_id:     Number(d.taller_id),
  fecha_entrega: d.fecha_entrega ? new Date(d.fecha_entrega).toISOString() : null,
}));

export type ConfeccionOutput = z.infer<typeof confeccionOutputSchema>;

// ── Labels para la UI ────────────────────────────────────────────────────────

export const ESTADO_LABELS: Record<typeof ESTADO_CONFECCION[number], string> = {
  pendiente:   "Pendiente",
  en_corte:    "En Corte",
  en_costura:  "En Costura",
  acabados:    "Acabados",
  completado:  "Completado",
  cancelado:   "Cancelado",
};

export const PRIORIDAD_LABELS: Record<typeof PRIORIDAD_CONFECCION[number], string> = {
  baja:    "Baja",
  media:   "Media",
  alta:    "Alta",
  urgente: "Urgente",
};
import { z } from "zod";

// Definimos los cargos basados en tu tipo public.Cargo de la DB
export const CARGOS_PERSONAL = [
  "administrador",
  "recepcionista",
  "disenador",
  "cortador",
  "ayudante",
  "representante_taller",
  "gerente"
] as const;

export const personalSchema = z.object({
  id: z.string().optional(),
  
  // Relación con la tabla usuarios
  usuario_id: z.union([z.string(), z.number()]).nullable().optional(),
  
  // Datos de Identidad
  dni: z.coerce.number({
    message: "El DNI debe ser un número",
  })
  .min(10000000, "DNI debe tener al menos 8 dígitos")
  .max(999999999999, "DNI demasiado largo")
  .nullable(),

  nombre_completo: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255)
    .nullable(),

  telefono: z.coerce.number({
    message: "El teléfono debe ser un número",
  })
  .nullable()
  .optional(),

  // Datos Laborales
  cargo: z.enum(CARGOS_PERSONAL, {
    error: () => ({ message: "Seleccione un cargo válido" }),
  }).nullable(),

  fecha_ingreso: z.coerce.date({
    message: "Fecha de ingreso inválida",
  }).nullable().optional(),

  estado: z.boolean().default(true),
});

export type PersonalFormValues = z.infer<typeof personalSchema>;
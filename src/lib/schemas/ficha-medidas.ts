import { z } from "zod";

export const fichaMedidaSchema = z.object({
  id: z.string().optional(),
  id_ficha: z.union([z.string(), z.number()]).nullable().optional(), // Match con tu SQL
  
  punto_medida: z.string()
    .min(1, "El punto de medida es requerido")
    .nullable(),
    
  talla: z.string()
    .min(1, "La talla es requerida")
    .nullable(),
    
  valor_cm: z.coerce.number({
    message: "Debe ser un número",
  })
  .min(0, "La medida no puede ser negativa")
  .nullable()
  .optional(),
  
  tolerancia: z.coerce.number({
    message: "Debe ser un número",
  })
  .min(0, "La tolerancia no puede ser negativa")
  .nullable()
  .optional(),
});

export type FichaMedidaFormValues = z.infer<typeof fichaMedidaSchema>;

// Schema para validación de arrays (útil para el servicio guardarMedidas)
export const fichaMedidasArraySchema = z.array(fichaMedidaSchema);
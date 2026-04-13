import { z } from 'zod';

// ENUMS (Basados en los tipos de tu base de datos)
const ESTADOS_CLIENTE = ['activo', 'inactivo'] as const;
const TIPOS_CLIENTE = ['corporativo', 'minorista', 'distribuidor'] as const; // <-- Actualizado

// SCHEMA DE CREACIÓN (Alineado estrictamente a SQL)
export const createClienteSchema = z.object({
  // Obligatorio en BD (NOT NULL)
  ruc: z.string()
    .min(8, 'El RUC debe tener al menos 8 caracteres')
    .max(11, 'El RUC no puede exceder los 11 caracteres'),
  razon_social: z.string().max(255, 'Máximo 255 caracteres').nullable(),
  nombre_comercial: z.string().max(255, 'Máximo 255 caracteres').nullable(),
  telefono: z.string().max(50, 'Máximo 50 caracteres').nullable(),
  
  email: z.string()
    .email('Email inválido')
    .max(150, 'Máximo 150 caracteres')
    .optional()
    .or(z.literal(''))
    .nullable(),
    
  direccion_fiscal: z.string().max(255, 'Máximo 255 caracteres').optional().nullable(),

  // Campos con valor por defecto en BD
  activo: z.enum(ESTADOS_CLIENTE).optional().default('activo'),
  tipo_cliente: z.enum(TIPOS_CLIENTE).optional().default('corporativo'),

  // Clave foránea opcional
  usuario_id: z.coerce.number().optional().nullable(), 

  // Auxiliares para el formulario (direcciones_cliente)
  direccion_alias: z.string().optional().or(z.literal('')),
  direccion_direccion: z.string().optional().or(z.literal('')),
  direccion_ciudad: z.string().optional().or(z.literal('')),
  direccion_departamento: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // Si el usuario decide agregar una dirección, validamos los campos obligatorios de Prisma
  if (data.direccion_alias || data.direccion_direccion || data.direccion_ciudad || data.direccion_departamento) {
    if (!data.direccion_alias) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El alias es obligatorio (Ej: Principal, Almacén)",
        path: ["direccion_alias"],
      });
    }
    if (!data.direccion_direccion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección exacta es obligatoria",
        path: ["direccion_direccion"],
      });
    }
  }
});

// SCHEMA PARA EDICIÓN
export const updateClienteSchema = createClienteSchema.partial().extend({
  id: z.coerce.number().min(1, 'El ID es obligatorio para actualizar'),
});

// TYPES EXPORTADOS
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
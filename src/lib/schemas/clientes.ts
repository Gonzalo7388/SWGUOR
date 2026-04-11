import { z } from 'zod';

// ============================================================
// ENUMS Y CONSTANTES
// ============================================================
const TIPOS_DOCUMENTO = ['DNI', 'RUC 10', 'RUC 20'] as const;
const ESTADOS_COMERCIALES = ['Activo', 'Inactivo', 'Prospecto'] as const;
const MONEDAS = ['Soles', 'Dólares Americanos', 'Euros'] as const;
const IMPUESTOS = ['IGV', 'EXONERADO', 'GRATUITO'] as const;

// ============================================================
// SCHEMA BASE DE CLIENTE
// ============================================================
const clienteBaseSchema = z.object({
  // ── Identificación Básica (obligatorios) ──
  tipo_documento: z.enum(TIPOS_DOCUMENTO, { message: 'Tipo de documento inválido' }),
  ruc: z.string().min(8, 'RUC/DNI debe tener al menos 8 caracteres').max(20, 'RUC/DNI demasiado largo'),

  // ── Persona Natural (RUC 10 / DNI) ──
  nombre: z.string().optional(),
  apellido_paterno: z.string().optional(),
  apellido_materno: z.string().optional(),

  // ── Persona Jurídica (RUC 20) ──
  razon_social: z.string().optional(),
  nombre_comercial: z.string().optional(),

  // ── Contacto y Ubicación ──
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().max(50, 'Teléfono demasiado largo').optional(),
  direccion_fiscal: z.string().max(255).optional(),
  pais: z.string().max(50).optional().default('Peru'),

  // ── Clasificación Comercial ──
  estado_comercial: z.enum(ESTADOS_COMERCIALES).optional().default('Activo'),
  lista_precios: z.string().max(50).optional(),
  sector: z.string().max(50).optional().default('General'),
  sub_sector: z.string().max(50).optional().default('General'),
  categoria_cliente: z.string().max(50).optional().default('General'),
  codigo_cliente: z.string().max(50).optional(),

  // ── Configuración de Ventas ──
  moneda_defecto: z.enum(MONEDAS).optional(),
  forma_pago_defecto: z.string().max(100).optional(),
  metodo_comercial: z.string().max(100).optional(),
  tipo_pedido_defecto: z.string().max(50).optional(),
  impuesto_defecto: z.enum(IMPUESTOS).optional().default('IGV'),

  // ── Dirección opcional (se crea en transacción) ──
  crear_direccion: z.boolean().optional().default(false),
  direccion_alias: z.string().max(100).optional(),
  direccion_detalle: z.string().max(255).optional(),
  direccion_ciudad: z.string().max(100).optional(),
  direccion_departamento: z.string().max(100).optional(),
});

// ============================================================
// VALIDACIÓN CONDICIONAL AVANZADA
// ============================================================
export const createClienteSchema = clienteBaseSchema
  // RUC: formato válido
  .refine(
    (data) => {
      if (data.tipo_documento === 'DNI') return /^\d{8}$/.test(data.ruc);
      if (data.tipo_documento === 'RUC 10') return /^\d{10}$/.test(data.ruc);
      if (data.tipo_documento === 'RUC 20') return /^\d{11}$/.test(data.ruc);
      return true;
    },
    {
      message: 'Formato de RUC/DNI inválido. DNI: 8 dígitos, RUC 10: 10 dígitos, RUC 20: 11 dígitos',
      path: ['ruc'],
    }
  )
  // Validación condicional: RUC 20 → razón_social obligatorio
  .refine(
    (data) => {
      if (data.tipo_documento === 'RUC 20') {
        return !!data.razon_social && data.razon_social.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Razón Social es obligatorio para RUC 20 (Persona Jurídica)',
      path: ['razon_social'],
    }
  )
  // Validación condicional: RUC 10 o DNI → nombre y apellido_paterno obligatorios
  .refine(
    (data) => {
      if (data.tipo_documento === 'RUC 10' || data.tipo_documento === 'DNI') {
        const nombreValido = !!data.nombre && data.nombre.trim().length > 0;
        const apellidoValido = !!data.apellido_paterno && data.apellido_paterno.trim().length > 0;
        return nombreValido && apellidoValido;
      }
      return true;
    },
    {
      message: 'Nombre y Apellido Paterno son obligatorios para Persona Natural (DNI/RUC 10)',
      path: ['nombre'],
    }
  )
  // Validación condicional: si crear_direccion = true, dirección_detalle es obligatorio
  .refine(
    (data) => {
      if (data.crear_direccion) {
        return !!data.direccion_detalle && data.direccion_detalle.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Dirección es obligatoria si desea crear dirección principal',
      path: ['direccion_detalle'],
    }
  );

// ============================================================
// SCHEMA PARA EDICIÓN (RUC no cambia, menos campos obligatorios)
// ============================================================
export const updateClienteSchema = clienteBaseSchema.partial().extend({
  id: z.string().min(1, 'ID de cliente es obligatorio'),
});

// ============================================================
// TYPES EXPORTADOS
// ============================================================
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

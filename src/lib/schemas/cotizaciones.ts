import { z } from 'zod';

// ITEMS DE COTIZACIÓN
export const cotizacionItemSchema = z.object({
  producto_id: z.string().min(1, 'Producto es obligatorio'),
  cantidad: z.number().optional(),
  precio_unitario: z.number().optional(),
});

// SCHEMA FLEXIBLE PARA PROYECTO UNIVERSITARIO
export const createCotizacionSchema = z.object({
  // Flexibilidad total para clientes
  cliente_id: z.string().optional(),
  nombre_cliente_manual: z.string().optional(),

  moneda: z.string().default('PEN'),
  valida_hasta: z.string().min(1, 'Fecha obligatoria'),
  tasa_impuesto: z.string().default('IGV'),

  // Convertimos enums a strings para aceptar "" (string vacío)
  empresa: z.string().optional(),
  contacto: z.string().optional(),
  tipo_destino: z.string().optional(),
  vendedor: z.string().optional(),
  tipo_venta: z.string().optional(),
  unidad_negocio: z.string().optional(),
  forma_pago: z.string().optional(),
  metodo: z.string().optional(),
  direccion_entrega: z.string().optional(),
  direccion_factura: z.string().optional(),
  condicion_entrega: z.string().optional(),
  tiempo_entrega: z.string().optional(),
  tipo_operacion: z.string().optional(),
  idioma: z.string().optional(),
  referencia: z.string().optional(),
  probabilidad: z.string().optional(),
  fecha_cierre: z.string().optional(),
  notas_internas: z.string().optional(),

  items: z.array(cotizacionItemSchema).min(1, 'Debe incluir al menos un ítem'),
});

export type CreateCotizacionInput = z.infer<typeof createCotizacionSchema>;
import { z } from 'zod';

// ── Item de guía ─────────────────────────────────────────────
const guiaRemisionItemSchema = z.object({
  producto_id:   z.number().int().positive(),
  cantidad:      z.number().positive(),
  unidad_medida: z.string().min(1).max(50),
  descripcion:   z.string().min(1).max(255),
});

// ── Schema base (POST) ────────────────────────────────────────
export const guiaRemisionSchema = z.object({
  numero:              z.string().min(1).max(100),
  tipo:                z.enum(['envio_taller', 'retorno_taller', 'despacho_cliente', 'devolucion_cliente', 'traslado_almacen']),
  origen_tipo:         z.string().min(1).max(100),
  origen_id:           z.number().int().positive().optional(),
  origen_direccion:    z.string().min(1).max(255),
  destino_tipo:        z.string().min(1).max(100),
  destino_id:          z.number().int().positive().optional(),
  destino_direccion:   z.string().min(1).max(255),
  pedido_id:           z.number().int().positive().optional(),
  orden_produccion_id: z.number().int().positive().optional(),
  transportista:       z.string().max(255).optional(),
  ruc_transportista:   z.string().max(11).optional(),
  placa_vehiculo:      z.string().max(20).optional(),
  fecha_traslado:      z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Fecha inválida' }),
  fecha_entrega:       z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Fecha inválida' }).optional(),
  motivo_traslado:     z.string().max(500).optional(),
  observaciones:       z.string().max(500).optional(),
  pdf_url:             z.string().url().optional(),
  emitido_por:         z.number().int().positive().optional(),
  estado:              z.enum(['borrador', 'emitida', 'en_transito', 'entregada', 'anulada']).default('borrador'),
  items:               z.array(guiaRemisionItemSchema).min(1),  // ← requerido en POST
});

// ── Schema update (PUT) ───────────────────────────────────────
export const guiaRemisionUpdateSchema = guiaRemisionSchema
  .partial()
  .extend({
    items: z.array(guiaRemisionItemSchema).optional(),  // ← opcional en PUT
  });

// ── Tipos ─────────────────────────────────────────────────────
export type GuiaRemisionInput  = z.infer<typeof guiaRemisionSchema>;
export type GuiaRemisionUpdate = z.infer<typeof guiaRemisionUpdateSchema>;
export type GuiaRemisionItem   = z.infer<typeof guiaRemisionItemSchema>;
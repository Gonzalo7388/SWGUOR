import { z } from 'zod';

export const asientosContablesSchema = z.object({
  fecha: z.string().refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Fecha inválida' }).optional(),
  tipo: z.enum(['debe', 'haber']),
  monto: z.number().positive(),
  cuenta: z.enum([
    'caja', 'bancos', 'cuentas_por_cobrar', 'inventario', 'ventas',
    'costo_ventas', 'cuentas_por_pagar', 'capital', 'igv', 'descuentos', 'gastos_operativos',
  ]),
  descripcion: z.string().max(500).optional(),
  pedido_id: z.number().int().positive().optional(),
  pago_id: z.number().int().positive().optional(),
  usuario_id: z.number().int().positive().optional(),
});

export const asientosContablesUpdateSchema = asientosContablesSchema.partial();

export type AsientosContablesInput = z.infer<typeof asientosContablesSchema>;
export type AsientosContablesUpdate = z.infer<typeof asientosContablesUpdateSchema>;
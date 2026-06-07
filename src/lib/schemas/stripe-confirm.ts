import { z } from 'zod';

const montoField = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .optional();

export const stripeConfirmRequestSchema = z
  .object({
    pedido_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    email: z.string().trim().email('Correo del cliente inválido'),
    payment_intent_id: z.string().trim().min(1, 'payment_intent_id requerido'),
    monto_a_pagar: montoField,
    monto: montoField,
    description: z.string().trim().optional(),
  })
  .refine((data) => Number.isFinite(data.pedido_id) && data.pedido_id > 0, {
    message: 'ID de pedido inválido',
    path: ['pedido_id'],
  })
  .transform((data) => ({
    pedido_id: data.pedido_id,
    email: data.email,
    payment_intent_id: data.payment_intent_id,
    monto_a_pagar: data.monto_a_pagar ?? data.monto,
    description: data.description,
  }));

export type StripeConfirmRequest = z.infer<typeof stripeConfirmRequestSchema>;

import { z } from 'zod';

const montoSolesField = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .optional();

export const culqiCheckoutRequestSchema = z
  .object({
    pedido_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    email: z.string().trim().email('Correo del cliente inválido'),
    /** Token de tarjeta/Yape generado por Culqi Checkout */
    token: z.string().trim().optional(),
    source_id: z.string().trim().optional(),
    description: z.string().trim().optional(),
    /** Monto a cobrar hoy en soles (validado contra saldo_pendiente en servidor) */
    monto_a_pagar: montoSolesField,
    /** Alias retrocompatible */
    monto: montoSolesField,
  })
  .refine((data) => Boolean(data.token || data.source_id), {
    message: 'Token o source_id de Culqi requerido',
    path: ['token'],
  })
  .refine((data) => Number.isFinite(data.pedido_id) && data.pedido_id > 0, {
    message: 'ID de pedido inválido',
    path: ['pedido_id'],
  })
  .transform((data) => ({
    pedido_id: data.pedido_id,
    email: data.email,
    token: data.token,
    source_id: data.source_id,
    description: data.description,
    monto_a_pagar: data.monto_a_pagar ?? data.monto,
  }));

export type CulqiCheckoutRequest = z.infer<typeof culqiCheckoutRequestSchema>;

export interface CulqiCheckoutSuccessData {
  pedido_id: number;
  pago_id: string;
  comprobante_id: string;
  numero_comprobante: string | null;
  pedido_estado: string | null;
  culqi_charge_id: string;
  redirect_url: string;
  monto_cobrado: number;
  monto_pagado: number;
  saldo_pendiente: number;
  pago_completo: boolean;
}

export interface CulqiCheckoutSuccessResponse {
  success: true;
  message: string;
  code: string;
  data: CulqiCheckoutSuccessData;
}

export interface CulqiCheckoutErrorResponse {
  success: false;
  message: string;
  code: string;
}

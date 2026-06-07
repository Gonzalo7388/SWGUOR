import { z } from 'zod';

export const culqiCheckoutRequestSchema = z
  .object({
    pedido_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    email: z.string().trim().email('Correo del cliente inválido'),
    token: z.string().trim().optional(),
    source_id: z.string().trim().optional(),
    description: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.token || data.source_id), {
    message: 'Token o source_id de Culqi requerido',
    path: ['token'],
  })
  .refine((data) => Number.isFinite(data.pedido_id) && data.pedido_id > 0, {
    message: 'ID de pedido inválido',
    path: ['pedido_id'],
  });

export type CulqiCheckoutRequest = z.infer<typeof culqiCheckoutRequestSchema>;

export interface CulqiCheckoutSuccessData {
  pedido_id: number;
  pago_id: string;
  comprobante_id: string;
  numero_comprobante: string | null;
  pedido_estado: string | null;
  culqi_charge_id: string;
  redirect_url: string;
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

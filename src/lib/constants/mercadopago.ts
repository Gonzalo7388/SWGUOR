/** Moneda por defecto para cobros Mercado Pago en el portal GUOR */
export const MERCADOPAGO_DEFAULT_CURRENCY = 'PEN' as const;

export function getMercadoPagoAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurada');
  }
  return token;
}

export function getMercadoPagoPublicKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  if (!publicKey) {
    throw new Error('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no está configurada');
  }
  return publicKey;
}

export function isMercadoPagoTestMode(): boolean {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? '';
  return token.startsWith('TEST-');
}

export function buildNotasPagoMercadoPago(paymentId: string | number): string {
  return `Pago automático Mercado Pago | payment_id=${String(paymentId).trim()}`;
}

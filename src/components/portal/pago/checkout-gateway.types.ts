import type { DatosPagadorPago } from '@/lib/schemas/datos-pagador-pago';

export interface CheckoutGatewayPanelProps {
  pedidoId: number;
  email: string;
  /** Monto a cobrar hoy (después de cupón) */
  montoSoles: number;
  /** Saldo pendiente del pedido en BD */
  saldoPendiente: number;
  /** Datos del titular de la tarjeta */
  datosPagador: DatosPagadorPago;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export interface CheckoutGatewayPanelProps {
  pedidoId: number;
  email: string;
  /** Monto a cobrar hoy (después de cupón) */
  montoSoles: number;
  /** Saldo pendiente del pedido en BD */
  saldoPendiente: number;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

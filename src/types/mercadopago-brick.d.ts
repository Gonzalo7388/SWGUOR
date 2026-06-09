export interface MercadoPagoCardFormData {
  token?: string;
  payment_method_id?: string;
  installments?: number;
  issuer_id?: string;
}

export interface MercadoPagoCardPaymentBrickController {
  getFormData: () => Promise<MercadoPagoCardFormData>;
  unmount?: () => void;
}

declare global {
  interface Window {
    cardPaymentBrickController?: MercadoPagoCardPaymentBrickController;
  }
}

export {};

'use client';

import { useCallback, useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import { formatearSoles } from '@/lib/helpers/pago-parcial.helper';
import { toDatosPagadorCheckoutPayload } from '@/lib/helpers/datos-pagador-pago.helper';
import { redirigirTrasPagoExitoso } from '@/lib/helpers/checkout-redirect.helper';
import type { CheckoutGatewayPanelProps } from '@/components/portal/pago/checkout-gateway.types';
import { BotonPagoAccion } from '@/components/portal/pago/BotonPagoAccion';
import type { MercadoPagoCardFormData } from '@/types/mercadopago-brick';

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() ?? '';

let mercadoPagoInicializado = false;

function inicializarMercadoPago() {
  if (!MP_PUBLIC_KEY || mercadoPagoInicializado) return;
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' });
  mercadoPagoInicializado = true;
}

export function MercadoPagoCheckoutPanel({
  pedidoId,
  email,
  montoSoles,
  saldoPendiente,
  datosPagador,
  disabled,
  onSuccess,
  onError,
}: CheckoutGatewayPanelProps) {
  const [sdkListo, setSdkListo] = useState(false);
  const [brickListo, setBrickListo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorConfig, setErrorConfig] = useState('');

  useEffect(() => {
    if (!MP_PUBLIC_KEY) {
      setErrorConfig('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no está configurada');
      return;
    }
    inicializarMercadoPago();
    setSdkListo(true);
  }, []);

  useEffect(() => {
    setBrickListo(false);
  }, [pedidoId, montoSoles]);

  const procesarCargo = useCallback(
    async (formData: MercadoPagoCardFormData) => {
      const token = formData.token?.trim();
      const paymentMethodId = formData.payment_method_id?.trim();

      if (!token || !paymentMethodId) {
        onError?.('Datos de tarjeta incompletos');
        return;
      }

      const res = await fetch('/api/pagos/mercadopago/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: pedidoId,
          email,
          token,
          payment_method_id: paymentMethodId,
          installments: formData.installments ?? 1,
          issuer_id: formData.issuer_id,
          monto_a_pagar: montoSoles,
          ...toDatosPagadorCheckoutPayload(datosPagador),
        }),
      });

      const json = await res.json();

      if (res.status === 202) {
        const msg = json.message ?? 'Pago en proceso de validación';
        onError?.(msg);
        return;
      }

      if (!res.ok || !json.success) {
        const msg = json.message ?? 'No se pudo procesar el pago';
        onError?.(msg);
        return;
      }

      redirigirTrasPagoExitoso(json.data?.redirect_url);
      onSuccess?.();
    },
    [pedidoId, email, montoSoles, datosPagador, onError, onSuccess],
  );

  const handleSubmit = async () => {
    if (disabled || procesando || montoSoles <= 0) return;

    const controller = window.cardPaymentBrickController;
    if (!controller?.getFormData) {
      onError?.('El formulario de tarjeta aún no está listo');
      return;
    }

    setProcesando(true);
    try {
      const formData = await controller.getFormData();
      await procesarCargo(formData);
    } catch {
      onError?.('Revisa los datos de la tarjeta e intenta de nuevo');
    } finally {
      setProcesando(false);
    }
  };

  if (errorConfig) {
    return (
      <p className="text-sm text-red-600 py-4 text-center">{errorConfig}</p>
    );
  }

  if (montoSoles <= 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">
        Ingresa un monto válido en el resumen de pago para cargar Mercado Pago.
      </p>
    );
  }

  if (!sdkListo) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando Mercado Pago...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disabled && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Complete los datos del pagador para habilitar el cobro con Mercado Pago.
        </p>
      )}
      <div className="rounded-xl border border-[#009ee3]/25 bg-[#f0f9ff] px-3.5 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#009ee3]/80">
          Resumen Mercado Pago
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Cargo hoy: <strong>{formatearSoles(montoSoles)}</strong>
          {' · '}
          Saldo del pedido: {formatearSoles(saldoPendiente)}
        </p>
      </div>

      <div key={`mp-${pedidoId}-${montoSoles}`}>
        <CardPayment
          initialization={{
            amount: montoSoles,
            payer: { email },
          }}
          customization={{
            visual: {
              hidePaymentButton: true,
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              maxInstallments: 1,
            },
          }}
          onSubmit={async (formData) => {
            if (disabled || procesando) return;
            setProcesando(true);
            try {
              await procesarCargo(formData);
            } finally {
              setProcesando(false);
            }
          }}
          onReady={() => setBrickListo(true)}
          onError={(brickError) => {
            const msg =
              typeof brickError === 'object' &&
              brickError !== null &&
              'message' in brickError &&
              typeof brickError.message === 'string'
                ? brickError.message
                : 'Error al cargar el formulario de Mercado Pago';
            onError?.(msg);
          }}
        />
      </div>

      <BotonPagoAccion
        onPagar={handleSubmit}
        procesando={procesando}
        deshabilitado={disabled || !brickListo}
        montoSoles={montoSoles}
        pasarela="Mercado Pago"
        tema="mercadopago"
      />
    </div>
  );
}

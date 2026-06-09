'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import { getMercadoPagoPublicKeyEnv } from '@/lib/constants/mercadopago';
import { formatearSoles } from '@/lib/helpers/pago-parcial.helper';
import { toDatosPagadorCheckoutPayload } from '@/lib/helpers/datos-pagador-pago.helper';
import { redirigirTrasPagoExitoso } from '@/lib/helpers/checkout-redirect.helper';
import {
  isMercadoPagoSdkReady,
  loadMercadoPagoSdkScript,
} from '@/lib/helpers/mercadopago-sdk-loader.helper';
import type { CheckoutGatewayPanelProps } from '@/components/portal/pago/checkout-gateway.types';
import { BotonPagoAccion } from '@/components/portal/pago/BotonPagoAccion';
import type { MercadoPagoCardFormData } from '@/types/mercadopago-brick';

const MP_PUBLIC_KEY = getMercadoPagoPublicKeyEnv();
const MP_PAYMENT_CONTAINER_ID = 'mp-payment-brick-container';

function normalizarFormDataTarjeta(
  payload: MercadoPagoCardFormData | { formData: MercadoPagoCardFormData },
): MercadoPagoCardFormData {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'formData' in payload &&
    payload.formData
  ) {
    return payload.formData;
  }
  return payload as MercadoPagoCardFormData;
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
  const [isMounted, setIsMounted] = useState(false);
  const [sdkListo, setSdkListo] = useState(false);
  const [brickListo, setBrickListo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorConfig, setErrorConfig] = useState('');

  const montoNumerico = useMemo(
    () => Math.round(Number(montoSoles) * 100) / 100,
    [montoSoles],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!MP_PUBLIC_KEY) {
      setErrorConfig('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no está configurada');
      setSdkListo(false);
      return;
    }

    let cancelado = false;

    const prepararSdk = async () => {
      try {
        await loadMercadoPagoSdkScript();

        if (cancelado) return;

        if (!isMercadoPagoSdkReady()) {
          throw new Error('Mercado Pago SDK no disponible en window.MercadoPago');
        }

        initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-PE' });

        if (cancelado) return;

        setSdkListo(true);
        setErrorConfig('');
      } catch (error) {
        if (cancelado) return;

        setSdkListo(false);
        setErrorConfig(
          error instanceof Error
            ? error.message
            : 'No se pudo inicializar Mercado Pago',
        );
      }
    };

    void prepararSdk();

    return () => {
      cancelado = true;
      window.paymentBrickController?.unmount?.();
    };
  }, [isMounted]);

  useEffect(() => {
    setBrickListo(false);
  }, [pedidoId, montoNumerico]);

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
          monto_a_pagar: montoNumerico,
          ...toDatosPagadorCheckoutPayload(datosPagador),
        }),
      });

      const json = await res.json();

      if (res.status === 202) {
        onError?.(json.message ?? 'Pago en proceso de validación');
        return;
      }

      if (!res.ok || !json.success) {
        onError?.(json.message ?? 'No se pudo procesar el pago');
        return;
      }

      redirigirTrasPagoExitoso(json.data?.redirect_url);
      onSuccess?.();
    },
    [pedidoId, email, montoNumerico, datosPagador, onError, onSuccess],
  );

  const handleSubmit = async () => {
    if (disabled || procesando || montoNumerico <= 0) return;

    const controller = window.paymentBrickController;
    if (!controller?.getFormData) {
      onError?.('El formulario de tarjeta aún no está listo');
      return;
    }

    setProcesando(true);
    try {
      const payload = await controller.getFormData();
      await procesarCargo(normalizarFormDataTarjeta(payload));
    } catch {
      onError?.('Revisa los datos de la tarjeta e intenta de nuevo');
    } finally {
      setProcesando(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Preparando checkout...
      </div>
    );
  }

  if (errorConfig) {
    return (
      <p className="text-sm text-red-600 py-4 text-center">{errorConfig}</p>
    );
  }

  if (montoNumerico <= 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">
        Ingresa un monto válido en el resumen de pago para cargar Mercado Pago.
      </p>
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
          Cargo hoy: <strong>{formatearSoles(montoNumerico)}</strong>
          {' · '}
          Saldo del pedido: {formatearSoles(saldoPendiente)}
        </p>
      </div>

      {!sdkListo ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando Mercado Pago...
        </div>
      ) : (
        <div
          id={MP_PAYMENT_CONTAINER_ID}
          key={`mp-payment-${montoNumerico}`}
        >
          <Payment
            initialization={{
              amount: montoNumerico,
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
                creditCard: 'all',
                debitCard: 'all',
                maxInstallments: 1,
              },
            }}
            onSubmit={async () => {
              // Con hidePaymentButton el cobro se dispara desde BotonPagoAccion.
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
      )}

      <BotonPagoAccion
        onPagar={handleSubmit}
        procesando={procesando}
        deshabilitado={disabled || !brickListo}
        montoSoles={montoNumerico}
        pasarela="Mercado Pago"
        tema="mercadopago"
      />
    </div>
  );
}

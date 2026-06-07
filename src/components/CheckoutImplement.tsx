'use client';

import { CulqiCheckoutButton } from '@/components/payments/CulqiCheckoutButton';

type CheckoutImplementProps = {
  amount: number;
  pedidoId: number;
  email?: string;
  onSuccess?: () => void;
};

const CheckoutImplement = ({
  amount,
  pedidoId,
  email = 'cliente@guor.com',
  onSuccess,
}: CheckoutImplementProps) => {
  return (
    <div className="space-y-3.5">
      <div className="rounded-xl border border-[#e4c28a]/30 bg-white px-3.5 py-3">
        <p className="text-sm font-semibold text-[#425f7c]">
          Completa tu pago de forma segura con Culqi.
        </p>
        <p className="text-xs text-[#6e8bab] mt-1">
          Monto a procesar: PEN {(amount / 100).toFixed(2)}
        </p>
      </div>

      <CulqiCheckoutButton
        amount={amount}
        email={email}
        orderId={String(pedidoId)}
        title={`Pedido #${pedidoId}`}
        chargePayload={{ pedido_id: pedidoId }}
        buttonLabel={`Pagar con Culqi — PEN ${(amount / 100).toFixed(2)}`}
        onSuccess={() => onSuccess?.()}
        className="[&_button]:h-12 [&_button]:rounded-xl [&_button]:bg-[#231e1d] [&_button]:text-[#e4c28a] [&_button]:font-black [&_button]:tracking-wide [&_button]:hover:bg-[#2f2927] [&_button]:disabled:bg-[#9b9b9f] [&_button]:disabled:text-[#ece0c9]"
      />

      {amount <= 0 && (
        <p className="text-xs text-[#6e8bab]">
          El botón se habilita cuando el total del pedido es mayor a 0.
        </p>
      )}
    </div>
  );
};

export default CheckoutImplement;

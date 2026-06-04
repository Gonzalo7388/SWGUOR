"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Definición de tipos para Culqi
declare global {
  interface Window {
    CulqiCheckout: new (
      publicKey: string,
      config: CulqiConfig
    ) => CulqiInstance;
  }
}


interface CulqiInstance {
  token?: { id: string };
  order?: unknown;
  error?: { user_message: string };
  culqi: () => void;
  open: () => void;
  close: () => void;
}

interface CulqiConfig {
  settings: {
    title: string;
    currency: string;
    amount: number;
    order?: string;
    xculqirsaid?: string;
    rsapublickey?: string;
  };
  client: {
    email: string;
  };
  options: {
    lang: string;
    installments: boolean;
    modal: boolean;
    container?: string;
    paymentMethods: {
      tarjeta?: boolean;
      yape?: boolean;
      billetera?: boolean;
      bancaMovil?: boolean;
      agente?: boolean;
      cuotealo?: boolean;
    };
    paymentMethodsSort: string[];
  };
}

const CULQI_CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
  ORDER_ID: process.env.NEXT_PUBLIC_CULQI_ORDER_ID,
  RSA_ID: process.env.NEXT_PUBLIC_CULQI_RSA_ID,
  RSA_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY,
  TITLE: process.env.NEXT_PUBLIC_CULQI_TITLE || "Pago GUOR",
  PAYMENT_METHODS: {
    yape: true,
    tarjeta: true,
    billetera: true,
    bancaMovil: true,
    agente: true,
    cuotealo: true,
  },
};

type CheckoutImplementProps = {
  amount: number;
  pedidoId: number;
  email?: string;
  onSuccess?: () => void;
};

type MetodoVisible = "tarjeta" | "yape" | "bank_transfer";

const CheckoutImplement = ({
  amount,
  pedidoId,
  email = "cliente@guor.com",
  onSuccess,
}: CheckoutImplementProps) => {
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  
  const scriptsLoadedRef = useRef<boolean>(false);

  // Función para crear la configuración de Culqi
  const createCulqiConfig = useCallback(
    (currentAmount: number): CulqiConfig => ({
      settings: {
        title: CULQI_CONFIG.TITLE,
        currency: "PEN",
        amount: currentAmount,
        ...(CULQI_CONFIG.ORDER_ID ? { order: CULQI_CONFIG.ORDER_ID } : {}),
        ...(CULQI_CONFIG.RSA_ID ? { xculqirsaid: CULQI_CONFIG.RSA_ID } : {}),
        ...(CULQI_CONFIG.RSA_PUBLIC_KEY
          ? { rsapublickey: CULQI_CONFIG.RSA_PUBLIC_KEY }
          : {}),
      },
      client: {
        email,
      },
      options: {
        lang: "auto",
        installments: false,
        modal: true,
        paymentMethods: CULQI_CONFIG.PAYMENT_METHODS,
        paymentMethodsSort: [
          "yape",
          "tarjeta",
          "billetera",
          "bancaMovil",
          "agente",
          "cuotealo",
        ],
      },
    }),
    [email]
  );

  const handleCulqiCharge = useCallback(
    async ({
      token,
      sourceId,
      description,
    }: {
      token?: string;
      sourceId?: string;
      description?: string;
    }) => {
      try {
        setError("");
        setIsCharging(true);

        const response = await fetch("/api/culqi/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(token ? { token } : {}),
            ...(sourceId ? { source_id: sourceId } : {}),
            pedido_id: pedidoId,
            amount,
            currency_code: "PEN",
            email,
            ...(description ? { description } : {}),
          }),
        });

        const data = await response.json();

        if (data.success) {
          onSuccess?.();
        } else {
          setError(data.message || "Error al procesar el pago");
        }
      } catch (err) {
        console.error("Error en handleCulqiCharge:", err);
        setError("Error de conexión. Intenta nuevamente.");
      } finally {
        setIsCharging(false);
        setIsPaying(false);
      }
    },
    [amount, email, onSuccess, pedidoId]
  );

  const handleToken = useCallback(
    async (tokenId: string) => {
      handleCulqiCharge({ token: tokenId });
    },
    [handleCulqiCharge]
  );

  const openCheckout = useCallback(() => {
    if (!CULQI_CONFIG.PUBLIC_KEY) {
      setError("Falta configurar NEXT_PUBLIC_CULQI_PUBLIC_KEY");
      return;
    }

    if (!window.CulqiCheckout) {
      setError("Culqi no se cargó correctamente. Recarga la página.");
      return;
    }

    setError("");
    setIsPaying(true);

    const config = createCulqiConfig(amount);
    const instance = new window.CulqiCheckout(CULQI_CONFIG.PUBLIC_KEY, config);

    instance.culqi = function () {
      // Cartões devuelven token, otros métodos pueden devolver source_id u object source
      const anyInstance: any = instance as any;

      if (instance.token && instance.token.id) {
        handleToken(instance.token.id);
        return;
      }

      // Intentar detectar source_id en distintas propiedades que Culqi pueda usar
      const detectedSourceId =
        anyInstance.source_id || anyInstance.source?.id || anyInstance.order?.source_id;

      if (detectedSourceId) {
        handleCulqiCharge({ sourceId: detectedSourceId });
        return;
      }

      setIsPaying(false);
      if (instance.error?.user_message) {
        setError(instance.error.user_message);
      }
    };

    instance.open();
  }, [amount, createCulqiConfig, handleToken]);

  

  // Cargar scripts de Culqi
  useEffect(() => {
    if (scriptsLoadedRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Verificar si el script ya existe
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadScripts = async () => {
      try {
        await loadScript("https://3ds.culqi.com");
        await loadScript("https://js.culqi.com/checkout-js");

        scriptsLoadedRef.current = true;
        setIsReady(true);
      } catch (err) {
        console.error("Error cargando scripts de Culqi:", err);
        setError("Error al cargar el sistema de pagos. Recarga la página.");
      }
    };

    loadScripts();
  }, []);

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

      <div>
        <button
          type="button"
          onClick={openCheckout}
          disabled={!isReady || isPaying || isCharging || amount <= 0}
          className="w-full h-12 rounded-xl bg-[#231e1d] text-[#e4c28a] font-black tracking-wide hover:bg-[#2f2927] disabled:bg-[#9b9b9f] disabled:text-[#ece0c9] disabled:cursor-not-allowed transition-colors"
        >
          {isCharging
            ? "Procesando pago..."
            : isPaying
            ? "Abriendo Culqi..."
            : `Pagar con Culqi — PEN ${(amount / 100).toFixed(2)}`}
        </button>
      </div>

      {amount <= 0 && (
        <p className="text-xs text-[#6e8bab]">
          El botón se habilita cuando el total del pedido es mayor a 0.
        </p>
      )}

      

      {!isReady && (
        <p className="text-xs text-slate-400">Cargando pasarela de pago...</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CheckoutImplement;
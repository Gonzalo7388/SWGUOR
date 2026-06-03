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
    order: string;
    xculqirsaid: string;
    rsapublickey: string;
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
  PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!,
  ORDER_ID: process.env.NEXT_PUBLIC_CULQI_ORDER_ID!,
  RSA_ID: process.env.NEXT_PUBLIC_CULQI_RSA_ID!,
  RSA_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY!,
  TITLE: process.env.NEXT_PUBLIC_CULQI_TITLE!,
  PAYMENT_METHODS: { yape: true,
  tarjeta: true,
  bancaMovil: true, },
};

const CheckoutImplement = () => {
  const [amount, setAmount] = useState(10000); 
  const [error, setError] = useState("");
  const scriptsLoadedRef = useRef<boolean>(false);
  const culqiInstanceRef = useRef<CulqiInstance | null>(null);

  // Función para crear la configuración de Culqi
  const createCulqiConfig = useCallback(
    (currentAmount: number): CulqiConfig => ({
      settings: {
        title: CULQI_CONFIG.TITLE,
        currency: "PEN",
        amount: amount,
        order: CULQI_CONFIG.ORDER_ID,
        xculqirsaid: CULQI_CONFIG.RSA_ID,
        rsapublickey: CULQI_CONFIG.RSA_PUBLIC_KEY,
      },
      client: {
        email: "donvoid@gmail.com",
      },
      options: {
        lang: "auto",
        installments: false,
        modal: false,
        paymentMethods: CULQI_CONFIG.PAYMENT_METHODS,
        paymentMethodsSort: [
            "yape",
            "tarjeta",
            "bancaMovil",
        ],
        container: "#culqi-checkout-container", // ID del contenedor
      },
    }),
    []
  );

  const handleToken = useCallback(
    async (tokenId: string) => {
      try {
        // culqiInstanceRef.current?.close();

        // Mostrar mensaje de verificación
        setError("");

        const response = await fetch("/api/culqi/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenId,
            amount: amount,
            currency_code: "PEN",
            email: "donvoid@gmail.com",
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Pago exitoso, crear la reserva
          console.log("Pago exitoso:", data.data);
        } else {
          setError(data.message || "Error al procesar el pago");
        }
      } catch (err) {
        console.error("Error en handleToken:", err);
        setError("Error de conexión. Intenta nuevamente.");
      }
    },
    [amount]
  );

  // Función para inicializar Culqi
  const initializeCulqi = useCallback(
  (currentAmount: number) => {


    if (!window.CulqiCheckout) return;

      const config = createCulqiConfig(currentAmount);
      const instance = new window.CulqiCheckout(
        CULQI_CONFIG.PUBLIC_KEY,
        config
      );

      instance.culqi = function () {
        if (instance.token) {
          console.log("Token creado:", instance.token.id);
          handleToken(instance.token.id);
        } else if (instance.order) {
          console.log("Order creada:", instance.order);
        } else {
          console.log("Error:", instance.error);
          setError(instance.error?.user_message || "Error al procesar el pago");
        }
      };

      culqiInstanceRef.current = instance;
      culqiInstanceRef.current.open();
    },
    [createCulqiConfig, handleToken]
  );

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
        

const scripts = document.querySelectorAll("script");
console.log("Cantidad scripts:", scripts.length);

            console.log("Scripts de Culqi cargados");

        scriptsLoadedRef.current = true;
        initializeCulqi(amount);
      } catch (err) {
        console.error("Error cargando scripts de Culqi:", err);
        setError("Error al cargar el sistema de pagos. Recarga la página.");
      }
    };

    loadScripts();
  }, [amount, initializeCulqi]);

return (
  <div className="min-w-screen h-screen flex flex-col items-center p-4">
  <div
    id="culqi-checkout-container"
    className="w-full h-full"
  />
</div>
);
};

export default CheckoutImplement;
// src/types/culqi.d.ts
export { };   // convierte el archivo en módulo para que declare global funcione

declare global {
    interface Window {
        Culqi: {
            publicKey: string;
            settings: (config: CulqiSettings) => void;
            open: () => void;
            close: () => void;
            yape: {
                generate: (params: CulqiYapeParams) => Promise<void>;
            };
            token?: CulqiToken;
            error?: CulqiError;
        };
        culqi?: () => void;   // callback global que Culqi invoca al tokenizar
    }
}

export interface CulqiSettings {
    currency: string;
    amount: number;
    order?: string;
    xculqirsaid?: string;
    rsapublickey?: string;
}

export interface CulqiYapeParams {
    phone: string;
    code: string;
}

export interface CulqiToken {
    id: string;
    email: string;
}

export interface CulqiError {
    user_message: string;
    merchant_message: string;
    code?: string;
}

export interface CulqiChargeRequest {
    amount: number;
    currency_code: 'PEN' | 'USD';
    email: string;
    token: string;
    description: string;
    installments?: number;
    metadata?: Record<string, string>;
}

export interface CulqiChargeResponse {
    id: string;
    amount: number;
    currency_code: string;
    email: string;
    status: 'paid' | 'failed' | 'pending';
    outcome: {
        type: string;
        code: string;
        merchant_message: string;
        user_message: string;
    };
    metadata: Record<string, string>;
}
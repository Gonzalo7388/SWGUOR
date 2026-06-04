'use client';

import { useEffect, useState } from 'react';

interface YapeFormProps {
    amount: number;
    orderId: string;
    onSuccess?: (chargeId: string) => void;
    onError?: (msg: string) => void;
}

export default function YapeForm({
    amount,
    orderId,
    onSuccess,
    onError,
}: YapeFormProps) {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!window.Culqi) return;

        window.Culqi.settings({
            currency: 'PEN',
            amount,
            order: orderId,
        });
    }, [amount, orderId]);

    // Callback global que Culqi invoca al tokenizar
    useEffect(() => {
        window.culqi = () => {
            if (window.Culqi.token) {
                handleCharge(window.Culqi.token.id);
            } else if (window.Culqi.error) {
                const msg = window.Culqi.error.user_message;
                setError(msg);
                onError?.(msg);
            }
        };
    }, [onError]);

    const handleCharge = async (tokenId: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/culqi/charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenId,
                    amount,
                    currency_code: 'PEN',
                }),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess?.(data.chargeId ?? '');
            } else {
                const msg = data.error || 'Error al procesar el pago';
                setError(msg);
                onError?.(msg);
            }
        } catch {
            const msg = 'Error de conexión. Intenta nuevamente.';
            setError(msg);
            onError?.(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async () => {
        if (!phone || !code) {
            setError('Ingresa tu número y código de aprobación');
            return;
        }
        setLoading(true);
        try {
            await window.Culqi.yape.generate({ phone, code });
        } catch {
            const msg = 'Error al generar el pago con Yape';
            setError(msg);
            onError?.(msg);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 border rounded-xl max-w-xs">
            <p className="text-sm text-gray-500">
                Abre tu app Yape → <strong>Código QR o código</strong> → ingresa los datos
            </p>

            <input
                type="tel"
                placeholder="Número de teléfono Yape"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={9}
                className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
                type="text"
                placeholder="Código de aprobación (6 dígitos)"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                className="border rounded-lg px-3 py-2 text-sm"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
                onClick={handlePagar}
                disabled={loading}
                className="bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition"
            >
                {loading ? 'Procesando...' : 'Pagar con Yape'}
            </button>
        </div>
    );
}
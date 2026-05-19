import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useConfirmarCotizacion() {
    const [confirmando, setConfirmando] = useState(false);
    const router = useRouter();

    const confirmar = async (cotizacionId: number) => {
        setConfirmando(true);
        const tid = toast.loading('Confirmando pedido...');
        try {
            const res = await fetch(
                `/api/portal/cotizaciones/${cotizacionId}/confirmar`,
                { method: 'POST' },
            );
            const json = await res.json();

            if (!res.ok) {
                const mensajes: Record<string, string> = {
                    estado_invalido: json.detalle ?? 'La cotización no puede convertirse en pedido',
                    ya_convertida: json.detalle ?? 'Esta cotización ya fue convertida',
                    Sin_permiso: 'No tienes permiso sobre esta cotización',
                };
                toast.error(mensajes[json.error] ?? 'Error al confirmar', { id: tid });
                return null;
            }

            toast.success('¡Pedido creado correctamente!', { id: tid });
            router.push(`/portal/pedidos/${json.data.pedido_id}`);
            return json.data.pedido_id;

        } catch (e: any) {
            toast.error(e.message ?? 'Error inesperado', { id: tid });
            return null;
        } finally {
            setConfirmando(false);
        }
    };

    return { confirmar, confirmando };
}
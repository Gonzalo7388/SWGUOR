import { useState, useCallback } from 'react';
import { AlmacenStock, AjustarStock } from '@/lib/schemas/almacenes';

interface MovimientoStock {
    id: bigint;
    tipo_movimiento: string;
    referencia_tipo: string;
    referencia_id: bigint;
    cantidad: number;
    motivo: string;
    created_at: Date;
}

interface FiltrosMovimientos {
    referenciaTipo?: string;
    desde?: string;
    hasta?: string;
    limit?: number;
}

export function useAlmacenStock(almacenId?: string) {
    const [stocks, setStocks] = useState<AlmacenStock[]>([]);
    const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const manejarError = (err: unknown): never => {
        const mensaje = err instanceof Error ? err.message : 'Error desconocido';
        setError(mensaje);
        throw new Error(mensaje);
    };

    const obtenerStock = useCallback(async (id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/stock`);
            if (!res.ok) throw new Error('Error al obtener stock');

            const data: AlmacenStock[] = await res.json();
            setStocks(data);
            return data;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const ajustarStock = useCallback(async (datos: AjustarStock, id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!res.ok) throw new Error('Error al ajustar stock');

            const actualizado: AlmacenStock = await res.json();
            setStocks(prev =>
                prev.map(s => s.id === actualizado.id ? actualizado : s)
            );
            return actualizado;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const obtenerMovimientos = useCallback(async (
        filtros?: FiltrosMovimientos,
        id?: string
    ) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams(
                Object.entries(filtros ?? {})
                    .filter(([, v]) => v !== undefined)
                    .map(([k, v]) => [k, String(v)])
            );
            const res = await fetch(`/api/almacenes/${targetId}/movimientos?${params}`);
            if (!res.ok) throw new Error('Error al obtener movimientos');

            const data: MovimientoStock[] = await res.json();
            setMovimientos(data);
            return data;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const verificarStock = useCallback(async (
        itemId: string,
        tipo: 'producto' | 'insumo' | 'material',
        cantidad: number,
        id?: string
    ) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setError(null);
        try {
            const params = new URLSearchParams({ itemId, tipo, cantidad: String(cantidad) });
            const res = await fetch(`/api/almacenes/${targetId}/stock/verificar?${params}`);
            if (!res.ok) throw new Error('Error al verificar stock');

            return await res.json() as { disponible: number; suficiente: boolean };
        } catch (err) {
            manejarError(err);
        }
    }, [almacenId]);

    const limpiarError = useCallback(() => setError(null), []);

    return {
        stocks,
        movimientos,
        loading,
        error,
        obtenerStock,
        ajustarStock,
        obtenerMovimientos,
        verificarStock,
        limpiarError,
    };
}
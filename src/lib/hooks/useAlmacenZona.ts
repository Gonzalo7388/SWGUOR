import { useState, useCallback } from 'react';
import { AlmacenZona, CrearZona, ActualizarZona } from '@/lib/schemas/almacenes';

export function useAlmacenZonas(almacenId?: string) {
    const [zonas, setZonas] = useState<AlmacenZona[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const manejarError = (err: unknown): never => {
        const mensaje = err instanceof Error ? err.message : 'Error desconocido';
        setError(mensaje);
        throw new Error(mensaje);
    };

    const obtenerZonas = useCallback(async (id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/zonas`);
            if (!res.ok) throw new Error('Error al obtener zonas');

            const data: AlmacenZona[] = await res.json();
            setZonas(data);
            return data;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const crearZona = useCallback(async (datos: CrearZona, id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/zonas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!res.ok) throw new Error('Error al crear zona');

            const nueva: AlmacenZona = await res.json();
            setZonas(prev => [...prev, nueva]);
            return nueva;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const actualizarZona = useCallback(async (zonaId: string, datos: ActualizarZona, id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/zonas/${zonaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });
            if (!res.ok) throw new Error('Error al actualizar zona');

            const actualizada: AlmacenZona = await res.json();
            setZonas(prev =>
                prev.map(z => z.id === actualizada.id ? actualizada : z)
            );
            return actualizada;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const toggleZona = useCallback(async (zonaId: string, activo: boolean, id?: string) => {
        const targetId = id ?? almacenId;
        if (!targetId) throw new Error('Se requiere un almacenId');

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/almacenes/${targetId}/zonas/${zonaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo }),
            });
            if (!res.ok) throw new Error('Error al cambiar estado de zona');

            const actualizada: AlmacenZona = await res.json();
            setZonas(prev =>
                prev.map(z => z.id === actualizada.id ? actualizada : z)
            );
            return actualizada;
        } catch (err) {
            manejarError(err);
        } finally {
            setLoading(false);
        }
    }, [almacenId]);

    const limpiarError = useCallback(() => setError(null), []);

    return {
        zonas,
        loading,
        error,
        obtenerZonas,
        crearZona,
        actualizarZona,
        toggleZona,
        limpiarError,
    };
}
import type { AlmacenZona } from '@/lib/schemas/almacenes';

export const almacenZonaHelpers = {

    // Verifica si la zona está activa
    estaActiva: (zona: AlmacenZona): boolean =>
        zona.activo === true,

    // Filtra solo las zonas activas
    filtrarActivas: (zonas: AlmacenZona[]): AlmacenZona[] =>
        zonas.filter(almacenZonaHelpers.estaActiva),

    // Filtra las zonas de un almacén específico
    filtrarPorAlmacen: (zonas: AlmacenZona[], almacenId: bigint): AlmacenZona[] =>
        zonas.filter((z) => z.almacen_id === almacenId),

    // Filtra activas de un almacén específico (combinación frecuente)
    filtrarActivasPorAlmacen: (zonas: AlmacenZona[], almacenId: bigint): AlmacenZona[] =>
        zonas.filter((z) => z.almacen_id === almacenId && z.activo === true),

    // Agrupa las zonas por almacén
    agruparPorAlmacen: (zonas: AlmacenZona[]): Record<string, AlmacenZona[]> =>
        zonas.reduce((acc, curr) => {
            const key = curr.almacen_id.toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {} as Record<string, AlmacenZona[]>),

    // Cuenta zonas activas de un almacén
    contarActivas: (zonas: AlmacenZona[]): number =>
        zonas.filter(almacenZonaHelpers.estaActiva).length,

    // Verifica si un almacén tiene al menos una zona activa
    almacenTieneZonas: (zonas: AlmacenZona[], almacenId: bigint): boolean =>
        zonas.some((z) => z.almacen_id === almacenId && z.activo === true),

    // Busca una zona por nombre dentro de un almacén
    buscarPorNombre: (zonas: AlmacenZona[], nombre: string): AlmacenZona | undefined =>
        zonas.find((z) => z.nombre.toLowerCase() === nombre.toLowerCase()),

    // Formatea el nombre con descripción si existe
    formatearNombre: (zona: AlmacenZona): string =>
        zona.descripcion
            ? `${zona.nombre} — ${zona.descripcion}`
            : zona.nombre,
};
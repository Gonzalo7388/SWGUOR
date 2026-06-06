// services/almacen-zonas.service.ts

import { prisma } from '@/lib/prisma';
import { Prisma, type almacen_zonas } from '@prisma/client';

export const almacenZonasService = {

    crear: async (
        almacenId: string,
        datos: Pick<Prisma.almacen_zonasCreateInput, 'nombre' | 'descripcion' | 'activo'>
    ): Promise<almacen_zonas> => {
        if (!datos.nombre) throw new Error('El nombre de la zona es obligatorio');

        // Verificar que el almacén existe y está activo
        const almacen = await prisma.almacenes.findUnique({
            where: { id: BigInt(almacenId) },
        });
        if (!almacen) throw new Error(`Almacén ${almacenId} no encontrado`);
        if (!almacen.estado) throw new Error(`Almacén ${almacenId} está inactivo`);

        // Verificar que no exista una zona con el mismo nombre en el mismo almacén
        const existente = await prisma.almacen_zonas.findFirst({
            where: {
                almacen_id: BigInt(almacenId),
                nombre: datos.nombre,
            },
        });
        if (existente) throw new Error(`Ya existe una zona llamada "${datos.nombre}" en este almacén`);

        return prisma.almacen_zonas.create({
            data: {
                almacen_id: BigInt(almacenId),
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                activo: datos.activo ?? true,
            },
        });
    },

    obtenerPorAlmacen: async (
        almacenId: string,
        soloActivas = true
    ): Promise<almacen_zonas[]> => {
        return prisma.almacen_zonas.findMany({
            where: {
                almacen_id: BigInt(almacenId),
                ...(soloActivas && { activo: true }),
            },
            orderBy: { nombre: 'asc' },
        });
    },

    obtenerPorId: async (
        almacenId: string,
        zonaId: string
    ): Promise<almacen_zonas | null> => {
        return prisma.almacen_zonas.findFirst({
            where: {
                id: BigInt(zonaId),
                almacen_id: BigInt(almacenId),
            },
        });
    },

    actualizar: async (
        almacenId: string,
        zonaId: string,
        datos: Pick<Prisma.almacen_zonasUpdateInput, 'nombre' | 'descripcion'>
    ): Promise<almacen_zonas> => {
        // Verificar que la zona pertenece al almacén
        const zona = await prisma.almacen_zonas.findFirst({
            where: {
                id: BigInt(zonaId),
                almacen_id: BigInt(almacenId),
            },
        });
        if (!zona) throw new Error(`Zona ${zonaId} no encontrada en el almacén ${almacenId}`);

        // Si cambia el nombre, verificar que no exista duplicado
        if (datos.nombre && datos.nombre !== zona.nombre) {
            const duplicado = await prisma.almacen_zonas.findFirst({
                where: {
                    almacen_id: BigInt(almacenId),
                    nombre: datos.nombre as string,
                    NOT: { id: BigInt(zonaId) },
                },
            });
            if (duplicado) throw new Error(`Ya existe una zona llamada "${datos.nombre}" en este almacén`);
        }

        return prisma.almacen_zonas.update({
            where: { id: BigInt(zonaId) },
            data: {
                nombre: datos.nombre,
                descripcion: datos.descripcion,
            },
        });
    },

    // Activar o desactivar una zona
    toggleActivo: async (
        almacenId: string,
        zonaId: string,
        activo: boolean
    ): Promise<almacen_zonas> => {
        const zona = await prisma.almacen_zonas.findFirst({
            where: {
                id: BigInt(zonaId),
                almacen_id: BigInt(almacenId),
            },
        });
        if (!zona) throw new Error(`Zona ${zonaId} no encontrada en el almacén ${almacenId}`);

        // Si se desactiva, verificar que no tenga stock asociado
        if (!activo) {
            const stockAsociado = await prisma.almacen_stock.count({
                where: {
                    zona_id: BigInt(zonaId),
                    cantidad: { gt: 0 },
                },
            });
            if (stockAsociado > 0)
                throw new Error(`No se puede desactivar la zona "${zona.nombre}" porque tiene stock asociado`);
        }

        return prisma.almacen_zonas.update({
            where: { id: BigInt(zonaId) },
            data: { activo },
        });
    },

    // Verificar si una zona tiene stock antes de eliminar
    eliminar: async (almacenId: string, zonaId: string): Promise<void> => {
        const zona = await prisma.almacen_zonas.findFirst({
            where: {
                id: BigInt(zonaId),
                almacen_id: BigInt(almacenId),
            },
        });
        if (!zona) throw new Error(`Zona ${zonaId} no encontrada en el almacén ${almacenId}`);

        const stockAsociado = await prisma.almacen_stock.count({
            where: { zona_id: BigInt(zonaId) },
        });
        if (stockAsociado > 0)
            throw new Error(`No se puede eliminar la zona "${zona.nombre}" porque tiene stock asociado`);

        await prisma.almacen_zonas.delete({
            where: { id: BigInt(zonaId) },
        });
    },

    // Contar zonas activas de un almacén
    contarActivas: async (almacenId: string): Promise<number> => {
        return prisma.almacen_zonas.count({
            where: {
                almacen_id: BigInt(almacenId),
                activo: true,
            },
        });
    },
};
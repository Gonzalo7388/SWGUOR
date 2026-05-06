import { prisma } from '@/lib/prisma';
import { CrearAlmacen, Almacen, ActualizarAlmacen } from '@/lib/schemas/almacenesSchema';

export const almacenesService = {
  crear: async (datos: CrearAlmacen): Promise<any> => {
    return await prisma.almacenes.create({
      data: {
        nombre: datos.nombre,
        estado: 'activo',
        descripcion: datos.ubicacion,
      },
    }) as any;
  },

  obtenerTodos: async (filtros?: any): Promise<any[]> => {
    const where: any = { estado: 'activo' };

    return await prisma.almacenes.findMany({
      where,
      orderBy: { nombre: 'asc' },
    }) as any;
  },

  obtenerPorId: async (id: string): Promise<any> => {
    return await prisma.almacenes.findUnique({
      where: { id: BigInt(id) },
    }) as any;
  },

  actualizar: async (id: string, datos: ActualizarAlmacen): Promise<any> => {
    return await prisma.almacenes.update({
      where: { id: BigInt(id) },
      data: { descripcion: datos.ubicacion },
    }) as any;
  },

  obtenerCapacidad: async (id: string) => {
    const almacen = await prisma.almacenes.findUnique({
      where: { id: BigInt(id) },
    });
    if (!almacen) return null;
    return {
      capacidadMaxima: almacen.capacidadTotal ?? 0,
      capacidadUsada: 0,
      disponible: almacen.capacidadTotal ?? 0,
      porcentaje: 0,
    };
  },

  actualizarCapacidad: async (id: string, _nuevoUso: number): Promise<Almacen> => {
    return await prisma.almacenes.findUniqueOrThrow({
      where: { id: BigInt(id) },
    }) as unknown as Almacen;
  },

  obtenerAlmacenesCriticos: async (): Promise<Almacen[]> => {
    return await prisma.almacenes.findMany({
      where: { estado: 'activo' },
    }) as unknown as Almacen[];
  },
};
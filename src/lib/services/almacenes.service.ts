import { prisma } from '@/lib/prisma';
import { Prisma, type almacenes } from '@prisma/client';

export interface CapacidadAlmacen {
  capacidadMaxima: number;
  capacidadUsada: number;
  disponible: number;
  porcentaje: number;
}

export const almacenesService = {

  crear: async (datos: Prisma.almacenesCreateInput): Promise<almacenes> => {
    if (!datos.nombre) throw new Error('El nombre del almacén es obligatorio');

    return prisma.almacenes.create({
      data: {
        nombre: datos.nombre,
        estado: datos.estado ?? true,
        descripcion: datos.descripcion,
        direccion: datos.direccion,
        telefono: datos.telefono,
        email: datos.email,
        capacidad_total: datos.capacidad_total,
        unidad_capacidad: datos.unidad_capacidad || 'unidades',
      },
    });
  },

  obtenerTodos: async (): Promise<almacenes[]> => {
    return prisma.almacenes.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
    });
  },

  obtenerPorId: async (id: string): Promise<almacenes | null> => {
    return prisma.almacenes.findUnique({
      where: { id: BigInt(id) },
    });
  },

  actualizar: async (id: string, datos: Prisma.almacenesUpdateInput): Promise<almacenes> => {
    return prisma.almacenes.update({
      where: { id: BigInt(id) },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        direccion: datos.direccion,
        telefono: datos.telefono,
        email: datos.email,
        capacidad_total: datos.capacidad_total,
      },
    });
  },

  // ─── CAPACIDAD ─────────────────────────────────────────────────────────────

  obtenerCapacidad: async (id: string): Promise<CapacidadAlmacen | null> => {
    const almacen = await prisma.almacenes.findUnique({
      where: { id: BigInt(id) },
    });
    if (!almacen) return null;

    // Suma toda la cantidad del stock de este almacén en una sola query
    const { _sum } = await prisma.almacen_stock.aggregate({
      where: { almacen_id: BigInt(id) },
      _sum: { cantidad: true },
    });

    const capacidadMaxima = Number(almacen.capacidad_total ?? 0);
    const capacidadUsada = Number(_sum.cantidad ?? 0);
    const disponible = capacidadMaxima - capacidadUsada;
    const porcentaje = capacidadMaxima > 0
      ? Math.min((capacidadUsada / capacidadMaxima) * 100, 100)
      : 0;

    return { capacidadMaxima, capacidadUsada, disponible, porcentaje };
  },

  // Actualiza los límites configurables del almacén (el "techo"), no el stock calculado
  actualizarCapacidad: async (
    id: string,
    datos: Pick<Prisma.almacenesUpdateInput, 'capacidad_total' | 'unidad_capacidad'>,
  ): Promise<almacenes> => {
    return prisma.almacenes.update({
      where: { id: BigInt(id) },
      data: {
        capacidad_total: datos.capacidad_total,
        unidad_capacidad: datos.unidad_capacidad,
      },
    });
  },

  // ─── CRÍTICOS ──────────────────────────────────────────────────────────────

  // Prisma no permite "WHERE columnaA < columnaB", así que usamos $queryRaw
  // para encontrar los almacenes con al menos un ítem por debajo de su stock_minimo.
  obtenerAlmacenesCriticos: async (): Promise<almacenes[]> => {
    const rows = await prisma.$queryRaw<{ almacen_id: bigint }[]>`
      SELECT DISTINCT almacen_id
      FROM almacen_stock
      WHERE stock_minimo IS NOT NULL
        AND stock_minimo > 0
        AND cantidad < stock_minimo
    `;

    if (rows.length === 0) return [];

    return prisma.almacenes.findMany({
      where: {
        id: { in: rows.map((r) => r.almacen_id) },
        estado: true,
      },
      orderBy: { nombre: 'asc' },
    });
  },
};
import { prisma } from '@/lib/prisma';
import { ordenes_compra, Prisma, EstadoOrdenCompra } from '@prisma/client';

// EstadoOrdenCompra válidos: pendiente | confirmada | parcialmente_recibida | completada | cancelada

interface FiltrosOrdenCompra {
  proveedor_id?: number | bigint;
  estado?: EstadoOrdenCompra;
}

type OrdenCompraConProveedor = Prisma.ordenes_compraGetPayload<{
  include: { proveedores: true };
}>;

export const ordenesCompraService = {
  crear: async (
    datos: Prisma.ordenes_compraUncheckedCreateInput,
  ): Promise<ordenes_compra> => {
    return prisma.ordenes_compra.create({
      data: {
        proveedor_id: datos.proveedor_id,
        estado:       'pendiente',
        total_orden:  datos.total_orden,
        notas:        datos.notas        ?? null,
        creado_por:   datos.creado_por   ?? null,
      },
    });
  },

  obtenerTodas: async (
    filtros?: FiltrosOrdenCompra,
  ): Promise<OrdenCompraConProveedor[]> => {
    return prisma.ordenes_compra.findMany({
      where: {
        ...(filtros?.proveedor_id && { proveedor_id: BigInt(filtros.proveedor_id) }),
        ...(filtros?.estado        && { estado: filtros.estado }),
      },
      orderBy: { created_at: 'desc' },
      include: { proveedores: true },
    });
  },

  // 'aprobada' no existe en el enum → se mapea a 'confirmada'
  aprobar: async (
    ordenId: bigint,
    observaciones?: string,
  ): Promise<ordenes_compra> => {
    return prisma.ordenes_compra.update({
      where: { id: ordenId },
      data:  { estado: 'confirmada', notas: observaciones ?? null },
    });
  },

  // 'recibida' no existe en el enum → se mapea a 'completada'
  recibir: async (ordenId: bigint): Promise<ordenes_compra> => {
    return prisma.ordenes_compra.update({
      where: { id: ordenId },
      data:  { estado: 'completada' },
    });
  },

  obtenerVencidas: async (): Promise<ordenes_compra[]> => {
    return prisma.ordenes_compra.findMany({
      where: {
        fecha_prometida: { lt: new Date() },
        estado:          { not: 'completada' },
      },
      orderBy: { fecha_prometida: 'asc' },
    });
  },

  actualizarEstado: async (
    ordenId: bigint,
    nuevoEstado: EstadoOrdenCompra,
  ): Promise<ordenes_compra> => {
    return prisma.ordenes_compra.update({
      where: { id: ordenId },
      data:  { estado: nuevoEstado },
    });
  },
};
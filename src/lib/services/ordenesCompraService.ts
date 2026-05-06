import { prisma } from '@/lib/prisma';
import { CrearOrdenCompra, OrdenCompra, ActualizarOrdenCompra } from '@/lib/schemas/ordenesCompraSchema';

export const ordenesCompraService = {
  crear: async (datos: CrearOrdenCompra): Promise<any> => {
    return await prisma.ordenes_compra.create({
      data: {
        proveedor_id: BigInt(datos.proveedorId),
        estado: 'pendiente',
        total_orden: datos.montoTotal,
        notas: datos.observaciones,
        creado_por: datos.creado_por,
      },
    });
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.proveedor_id) where.proveedor_id = BigInt(filtros.proveedor_id);
    if (filtros?.estado) where.estado = filtros.estado;

    return await prisma.ordenes_compra.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { proveedores: true },
    });
  },

  aprobar: async (ordenId: string, aprobadoPor: string, observaciones?: string): Promise<any> => {
    return await prisma.ordenes_compra.update({
      where: { id: BigInt(ordenId) },
      data: {
        estado: 'aprobada',
        notas: observaciones,
      },
    });
  },

  recibir: async (ordenId: string, cantidadRecibida: number): Promise<any> => {
    return await prisma.ordenes_compra.update({
      where: { id: BigInt(ordenId) },
      data: {
        estado: 'recibida',
      },
    });
  },

  obtenerVencidas: async (): Promise<any[]> => {
    const ahora = new Date();
    return await prisma.ordenes_compra.findMany({
      where: {
        fecha_prometida: { lt: ahora },
        estado: { not: 'recibida' },
      },
      orderBy: { fecha_prometida: 'asc' },
    });
  },
    
  actualizarEstatus: async (ordenId: string, nuevoEstatus: string): Promise<any> => {
    return await prisma.ordenes_compra.update({
      where: { id: BigInt(ordenId) },
      data: { estado: nuevoEstatus as any },
    });
  },
};

import { prisma } from '@/lib/prisma';
import { CrearAsientoContable, AsientoContable } from '@/lib/schemas/asientosContablesSchema';

export const asientosContablesService = {
  listar: async (filtros?: any): Promise<AsientoContable[]> => {
    const where: any = {};
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.cuenta) where.cuenta = filtros.cuenta;
    if (filtros?.pedido_id) where.pedido_id = BigInt(filtros.pedido_id);
    if (filtros?.pago_id) where.pago_id = BigInt(filtros.pago_id);
    if (filtros?.desde || filtros?.hasta) {
      where.fecha = {};
      if (filtros?.desde) where.fecha.gte = filtros.desde;
      if (filtros?.hasta) where.fecha.lte = filtros.hasta;
    }

    return await prisma.asientos_contables.findMany({
      where,
      orderBy: { fecha: 'desc' },
    }) as unknown as Promise<any[]>;
  },

  obtenerPorId: async (id: string): Promise<any | null> => {
    return await prisma.asientos_contables.findUnique({
      where: { id: BigInt(id) },
    }) as unknown as Promise<any | null>;
  },

  crear: async (datos: CrearAsientoContable): Promise<any> => {
    const body = datos as any;
    return await prisma.asientos_contables.create({
      data: {
        fecha: body.fecha,
        tipo: body.tipo,
        monto: body.monto,
        cuenta: body.cuenta,
        descripcion: body.descripcion,
        pedido_id: body.pedido_id ? BigInt(body.pedido_id) : undefined,
        pago_id: body.pago_id ? BigInt(body.pago_id) : undefined,
        usuario_id: body.usuario_id ? BigInt(body.usuario_id) : undefined,
      },
    }) as Promise<any>;
  },

  actualizar: async (id: string, datos: Partial<CrearAsientoContable>): Promise<any> => {
    const body = datos as any;
    return await prisma.asientos_contables.update({
      where: { id: BigInt(id) },
      data: {
        ...(body.fecha ? { fecha: body.fecha } : {}),
        ...(body.tipo ? { tipo: body.tipo } : {}),
        ...(body.monto !== undefined ? { monto: body.monto } : {}),
        ...(body.cuenta ? { cuenta: body.cuenta } : {}),
        ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
        ...(body.pedido_id !== undefined ? { pedido_id: body.pedido_id ? BigInt(body.pedido_id) : null } : {}),
        ...(body.pago_id !== undefined ? { pago_id: body.pago_id ? BigInt(body.pago_id) : null } : {}),
        ...(body.usuario_id !== undefined ? { usuario_id: body.usuario_id ? BigInt(body.usuario_id) : null } : {}),
      },
    }) as Promise<any>;
  },

  eliminar: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      await prisma.asientos_contables.delete({
        where: { id: BigInt(id) },
      });
      return { success: true, message: 'Registro eliminado correctamente' };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return { success: false, message: 'Registro no encontrado' };
      }
      throw error;
    }
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    return await asientosContablesService.listar(filtros);
  },

  aprobar: async (_asientoId: string, _aprobadoPor: string): Promise<AsientoContable> => {
    throw new Error('No implementado');
  },

  reversear: async (_asientoId: string, _motivo: string): Promise<AsientoContable> => {
    throw new Error('No implementado');
  },

  obtenerPorPeriodo: async (desde: Date, hasta: Date): Promise<any[]> => {
    return await prisma.asientos_contables.findMany({
      where: {
        fecha: { gte: desde, lte: hasta },
      },
      orderBy: { fecha: 'desc' },
    }) as unknown as Promise<any[]>;
  },
};

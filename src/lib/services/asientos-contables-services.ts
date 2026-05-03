import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { AsientosContablesInput, AsientosContablesUpdate } from '@/lib/schemas/asientos-contables';

export const AsientosContablesService = {
  async listar(filter?: { pedido_id?: string; pago_id?: string }) {
    const where: Record<string, unknown> = {};
    if (filter?.pedido_id) where.pedido_id = BigInt(filter.pedido_id);
    if (filter?.pago_id) where.pago_id = BigInt(filter.pago_id);

    const registros = await prisma.asientos_contables.findMany({
      where,
      include: { pedidos: true, pagos: true },
      orderBy: { fecha: 'desc' },
    });

    return serializeBigInt(registros);
  },

  async obtenerPorId(id: string) {
    const registro = await prisma.asientos_contables.findUnique({
      where: { id: BigInt(id) },
      include: { pedidos: true, pagos: true },
    });
    return registro ? serializeBigInt(registro) : null;
  },

  async crear(data: AsientosContablesInput) {
    const registro = await prisma.asientos_contables.create({
      data: {
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        tipo: data.tipo,
        monto: data.monto,
        cuenta: data.cuenta,
        descripcion: data.descripcion,
        pedido_id: data.pedido_id ? BigInt(data.pedido_id) : undefined,
        pago_id: data.pago_id ? BigInt(data.pago_id) : undefined,
        usuario_id: data.usuario_id ? BigInt(data.usuario_id) : undefined,
      },
      include: { pedidos: true, pagos: true },
    });

    return serializeBigInt(registro);
  },

  async actualizar(id: string, data: AsientosContablesUpdate) {
    const updateData: Record<string, unknown> = {};
    if (data.fecha !== undefined) updateData.fecha = data.fecha ? new Date(data.fecha) : undefined;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.monto !== undefined) updateData.monto = data.monto;
    if (data.cuenta !== undefined) updateData.cuenta = data.cuenta;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.pedido_id !== undefined) updateData.pedido_id = data.pedido_id ? BigInt(data.pedido_id) : null;
    if (data.pago_id !== undefined) updateData.pago_id = data.pago_id ? BigInt(data.pago_id) : null;
    if (data.usuario_id !== undefined) updateData.usuario_id = data.usuario_id ? BigInt(data.usuario_id) : null;

    const registro = await prisma.asientos_contables.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { pedidos: true, pagos: true },
    });

    return serializeBigInt(registro);
  },

  async eliminar(id: string) {
    await prisma.asientos_contables.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};
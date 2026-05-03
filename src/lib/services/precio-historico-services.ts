import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import type { PrecioHistoricoInput, PrecioHistoricoUpdate } from '@/lib/schemas/precio-historico';

export const PrecioHistoricoService = {
  async listar(producto_id?: string) {
    const where: Record<string, unknown> = {};
    if (producto_id) {
      where.producto_id = BigInt(producto_id);
    }

    const registros = await prisma.precio_historico.findMany({
      where,
      include: {
        productos: true,
        usuarios: true,
      },
      orderBy: { vigente_desde: 'desc' },
    });

    return serializeBigInt(registros);
  },

  async obtenerPorId(id: string) {
    const registro = await prisma.precio_historico.findUnique({
      where: { id: BigInt(id) },
      include: { productos: true, usuarios: true },
    });
    return registro ? serializeBigInt(registro) : null;
  },

  async crear(data: PrecioHistoricoInput) {
    const registro = await prisma.precio_historico.create({
      data: {
        producto_id: BigInt(data.producto_id),
        precio: data.precio,
        motivo: data.motivo,
        vigente_desde: new Date(data.vigente_desde),
        vigente_hasta: data.vigente_hasta ? new Date(data.vigente_hasta) : undefined,
        creado_por: data.creado_por ? BigInt(data.creado_por) : undefined,
      },
      include: { productos: true, usuarios: true },
    });

    return serializeBigInt(registro);
  },

  async actualizar(id: string, data: PrecioHistoricoUpdate) {
    const updateData: Record<string, unknown> = {};
    if (data.producto_id !== undefined) updateData.producto_id = BigInt(data.producto_id);
    if (data.precio !== undefined) updateData.precio = data.precio;
    if (data.motivo !== undefined) updateData.motivo = data.motivo;
    if (data.vigente_desde !== undefined) updateData.vigente_desde = new Date(data.vigente_desde);
    if (data.vigente_hasta !== undefined) updateData.vigente_hasta = data.vigente_hasta ? new Date(data.vigente_hasta) : null;
    if (data.creado_por !== undefined) updateData.creado_por = data.creado_por ? BigInt(data.creado_por) : null;

    const registro = await prisma.precio_historico.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { productos: true, usuarios: true },
    });

    return serializeBigInt(registro);
  },

  async eliminar(id: string) {
    await prisma.precio_historico.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};
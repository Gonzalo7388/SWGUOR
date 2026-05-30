import { prisma } from '@/lib/prisma';
import { DESPACHO_ESTADOS_BLOQUEAN_DIRECCION } from '@/lib/constants/pedido-tracker';

export async function actualizarDireccionDespachoPedido(params: {
  pedidoId: bigint;
  clienteId: bigint;
  direccion: string;
}) {
  const direccion = params.direccion.trim();
  if (direccion.length < 10) {
    return {
      ok: false as const,
      status: 400,
      error: 'direccion_invalida',
      mensaje: 'Indique una dirección de entrega válida (mínimo 10 caracteres).',
    };
  }

  const pedido = await prisma.pedidos.findFirst({
    where: { id: params.pedidoId, cliente_id: params.clienteId },
    select: { id: true, estado: true },
  });

  if (!pedido) {
    return { ok: false as const, status: 404, error: 'pedido_no_encontrado' };
  }

  if (pedido.estado !== 'listo_para_despacho') {
    return {
      ok: false as const,
      status: 422,
      error: 'estado_no_permitido',
      mensaje:
        'Solo puede actualizar la dirección cuando el pedido está listo para despacho.',
    };
  }

  const despachoBloqueante = await prisma.despachos.findFirst({
    where: {
      pedido_id: params.pedidoId,
      estado: { in: DESPACHO_ESTADOS_BLOQUEAN_DIRECCION },
    },
    select: { id: true },
  });

  if (despachoBloqueante) {
    return {
      ok: false as const,
      status: 422,
      error: 'despacho_en_curso',
      mensaje:
        'No puede modificar la dirección: el pedido ya tiene un despacho en ruta o entregado.',
    };
  }

  const actualizado = await prisma.pedidos.update({
    where: { id: params.pedidoId },
    data: { direccion_despacho: direccion, updated_at: new Date() },
    select: { id: true, direccion_despacho: true, estado: true },
  });

  await prisma.seguimiento_pedido.create({
    data: {
      pedido_id: params.pedidoId,
      status: 'listo_para_despacho',
      notas: `Cliente actualizó dirección de despacho: ${direccion}`,
    },
  });

  return { ok: true as const, data: actualizado };
}

import { prisma } from '@/lib/prisma';
import { crearNotificacion } from '@/lib/helpers/crear-notificacion.helper';

export async function procesarFichaTecnicaAprobada(params: {
  fichaId: bigint;
  productoId: bigint;
  pedidoId: bigint;
  usuarioId: bigint;
}): Promise<void> {
  const orden = await prisma.ordenes_produccion.findFirst({
    where: {
      pedido_id: params.pedidoId,
      producto_id: params.productoId,
    },
    orderBy: { created_at: 'desc' },
    select: { id: true },
  });

  if (orden) {
    const seguimientoExistente = await prisma.seguimiento_produccion.findFirst({
      where: {
        orden_id: orden.id,
        etapa: 'diseno',
        completado_en: { not: null },
      },
      select: { id: true },
    });

    if (!seguimientoExistente) {
      await prisma.seguimiento_produccion.create({
        data: {
          orden_id: orden.id,
          etapa: 'diseno',
          completado_en: new Date(),
          usuario_id: params.usuarioId,
          observaciones: `Ficha técnica #${params.fichaId} aprobada para producción.`,
          activo: true,
        },
      });
    }
  }

  const cortadores = await prisma.usuarios.findMany({
    where: {
      rol: 'cortador',
      estado: 'activo',
    },
    select: { id: true },
  });

  const pedidoRef = String(params.pedidoId);
  const urlDestino = `/cortador/pedidos/${pedidoRef}`;

  await Promise.all(
    cortadores.map((cortador) =>
      crearNotificacion({
        usuario_id: cortador.id,
        tipo: 'orden_produccion',
        titulo: 'Pedido listo para corte',
        mensaje: `La ficha técnica del pedido #${pedidoRef} fue aprobada. Puede iniciar el corte.`,
        referencia_tipo: 'PEDIDO',
        referencia_id: params.pedidoId,
        url_destino: urlDestino,
      }),
    ),
  );
}

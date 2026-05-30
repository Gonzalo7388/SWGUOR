import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { CortadorPedidoWorkspace } from '@/components/cortador/CortadorPedidoWorkspace';
import type { DetallePedidoData } from '@/components/admin/pedidos/detalles/types';
import {
  obtenerDatosFichaParaCorte,
} from '@/lib/helpers/registrar-corte-pedido.helper';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

function resolverProductoPrincipalId(
  items: Array<{
    cantidad: number;
    producto_id?: bigint | null;
    productos?: { id: bigint; nombre: string } | null;
  }>,
): { productoId: bigint; nombre: string } {
  const acumulado = new Map<string, number>();

  for (const item of items) {
    const pid = item.productos?.id ?? item.producto_id;
    if (!pid) continue;
    const key = String(pid);
    acumulado.set(key, (acumulado.get(key) ?? 0) + item.cantidad);
  }

  let mejorId = items[0]?.productos?.id ?? items[0]?.producto_id ?? BigInt(0);
  let maxCant = 0;

  for (const [id, cant] of acumulado) {
    if (cant > maxCant) {
      maxCant = cant;
      mejorId = BigInt(id);
    }
  }

  const nombre =
    items.find((i) => String(i.productos?.id ?? i.producto_id) === String(mejorId))
      ?.productos?.nombre ?? 'Producto';

  return { productoId: mejorId, nombre };
}

export default async function CortadorPedidoPage({ params }: PageProps) {
  const { id } = await params;
  const pedidoId = BigInt(id);

  const pedido = await prisma.pedidos.findUnique({
    where: { id: pedidoId },
    include: {
      clientes: {
        select: {
          id: true,
          ruc: true,
          razon_social: true,
          nombre_comercial: true,
          telefono: true,
          email: true,
          tipo_cliente: true,
        },
      },
      cotizacion: { select: { id: true, numero: true } },
      pedido_items: {
        include: {
          productos: { select: { id: true, nombre: true, sku: true } },
          variantes_producto: {
            select: { id: true, color: true, talla: true, sku: true },
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!pedido) notFound();

  const { productoId, nombre: productoNombre } = resolverProductoPrincipalId(
    pedido.pedido_items,
  );

  const fichaRaw = await obtenerDatosFichaParaCorte(productoId);

  const orden = await prisma.ordenes_produccion.findFirst({
    where: {
      pedido_id: pedidoId,
      producto_id: productoId,
      estado: { not: 'cancelada' },
    },
    orderBy: { created_at: 'desc' },
    include: {
      seguimiento_produccion: {
        where: { etapa: 'corte', completado_en: { not: null } },
        take: 1,
      },
    },
  });

  const corteCompletado = (orden?.seguimiento_produccion?.length ?? 0) > 0;
  const ordenId = orden ? String(orden.id) : null;

  const serializado = serializeBigInt(pedido) as Record<string, unknown>;

  const pedidoFormateado: DetallePedidoData = {
    ...(serializado as unknown as DetallePedidoData),
    pedido_items: (
      (serializado.pedido_items as DetallePedidoData['pedido_items']) ?? []
    ).map((item) => ({
      ...item,
      especificaciones:
        typeof item.especificaciones === 'object' ? item.especificaciones : null,
    })),
    cotizacion: serializado.cotizacion
      ? {
          id: String((serializado.cotizacion as { id: unknown }).id),
          numero: String((serializado.cotizacion as { numero: string }).numero),
        }
      : null,
  };

  return (
    <CortadorPedidoWorkspace
      pedido={pedidoFormateado}
      productoNombre={productoNombre}
      ficha={fichaRaw}
      corteCompletado={corteCompletado}
      ordenId={ordenId}
    />
  );
}

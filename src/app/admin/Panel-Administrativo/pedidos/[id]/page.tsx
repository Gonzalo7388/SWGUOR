import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import PedidoDetalle, { type DetallePedidoData, type TallerOption } from "@/components/admin/pedidos/detalles/PedidoDetalle";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PageProps) {
  const { id } = await params;

  let pedido;
  let talleres;

  try {
    pedido = await prisma.pedidos.findUnique({
      where: { id: BigInt(id) },
      include: {
        clientes: {
          select: {
            id: true,
            ruc: true,
            razon_social: true,
            nombre_comercial: true,
            telefono: true,
            email: true,
          },
        },
        pedido_items: {
          include: {
            productos: { select: { id: true, nombre: true, sku: true, imagen: true, fichas_tecnicas: true } },
            variantes_producto: { select: { id: true, color: true, talla: true, sku: true } },
          },
        },
        seguimiento_pedido: { orderBy: { created_at: 'desc' } },
        ordenes_produccion: {
          include: {
            fichas_tecnicas: { select: { id: true, version: true, estado: true } },
            talleres: { select: { id: true, nombre: true } },
            seguimiento_produccion: {
              where: { activo: true },
              take: 1,
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!pedido) notFound();

    // Talleres activos para el modal
    talleres = await prisma.talleres.findMany({
      where: { estado: 'activo' },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, especialidad: true, contacto: true, email: true },
    });
  } catch (error) {
    console.error("Error cargando pedido:", error);
    notFound();
  }

  // ── CORRECCIÓN ESTRICTA SIN "AS ANY" ──
  // Forzamos el tipado correcto a través del valor de retorno de la serialización 
  // usando un Type Assertion específico ("as DetallePedidoData" y "as TallerOption[]")
  const pedidoSerializado = serializeBigInt(pedido) as unknown as DetallePedidoData;
  const talleresSerializados = serializeBigInt(talleres) as unknown as TallerOption[];

  return (
    <PedidoDetalle
      pedido={pedidoSerializado}
      talleres={talleresSerializados}
    />
  );
}
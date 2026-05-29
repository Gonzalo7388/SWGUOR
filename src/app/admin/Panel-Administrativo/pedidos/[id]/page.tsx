import { notFound }         from "next/navigation";
import { prisma }           from "@/lib/prisma";
import { serializeBigInt }  from "@/lib/utils/serialize";
import PedidoDetalle, {
  type DetallePedidoData,
  type TallerOption,
} from "@/components/admin/pedidos/detalles/PedidoDetalle";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PageProps) {
  const { id } = await params;

  let pedido;

  try {
    pedido = await prisma.pedidos.findUnique({
      where: { id: BigInt(id) },
      include: {
        clientes: {
          select: {
            id:               true,
            ruc:              true,
            razon_social:     true,
            nombre_comercial: true,
            telefono:         true,
            email:            true,
          },
        },
        pedido_items: {
          include: {
            productos: {
              select: {
                id:     true,
                nombre: true,
                sku:    true,
                imagen: true,   // por si TabItems muestra imagen
              },
            },
            variantes_producto: {   // ← esto faltaba
              select: {
                id:    true,
                color: true,
                talla: true,
                sku:   true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
        seguimiento_pedido: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!pedido) notFound();

  } catch (error) {
    console.error("[PedidoDetallePage] Error cargando pedido:", error);
    notFound();
  }

  const talleres: TallerOption[] = [];

  return (
    <PedidoDetalle
      pedido={serializeBigInt(pedido) as unknown as DetallePedidoData}
      talleres={talleres}
    />
  );
}
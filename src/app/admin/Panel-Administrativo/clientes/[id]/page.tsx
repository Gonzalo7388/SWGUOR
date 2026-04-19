import { notFound }      from "next/navigation";
import { prisma }        from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import ClienteDetalle    from "@/components/admin/clientes/detalles/ClienteDetalle";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: BigInt(id) },
      include: {
        direcciones_cliente: { orderBy: { es_principal: 'desc' } },
        pedidos: {
          select: {
            id:             true,
            estado:         true,
            prioridad:      true,
            total_estimado: true,
            total_unidades: true,
            created_at:     true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: { select: { pedidos: true, cotizaciones: true } },
      },
    });

    if (!cliente) notFound();

    return <ClienteDetalle cliente={serializeBigInt(cliente)} />;
  } catch (error) {
    console.error("Error cargando cliente:", error);
    notFound();
  }
}
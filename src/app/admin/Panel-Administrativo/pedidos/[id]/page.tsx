import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import PedidoDetalle from "@/components/admin/pedidos/detalles/PedidoDetalle";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const pedido = await prisma.pedidos.findUnique({
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
            productos:          { select: { id: true, nombre: true, sku: true, imagen: true, fichas_tecnicas: true } },
            variantes_producto: { select: { id: true, color: true, talla: true, sku: true } },
          },
        },
        seguimiento_pedido: { orderBy: { created_at: 'desc' } },
        confecciones: {
          include: {
            talleres: { select: { id: true, nombre: true, contacto: true, email: true } },
          },
          orderBy: { created_at: 'desc' },
        },
        ordenes_produccion: {
          include: {
            fichas_tecnicas:        { select: { id: true, version: true, estado: true } },
            talleres:               { select: { id: true, nombre: true } },
            seguimiento_produccion: {
              where:   { activo: true },
              take:    1,
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!pedido) notFound();

    // Talleres activos para el modal
    const talleres = await prisma.talleres.findMany({
      where:   { estado: 'activo' },
      orderBy: { nombre: 'asc' },
      select:  { id: true, nombre: true, especialidad: true, contacto: true, email: true },
    });

    return (
      <PedidoDetalle
        pedido={serializeBigInt(pedido)}
        talleres={serializeBigInt(talleres)}
      />
    );
  } catch (error) {
    console.error("Error cargando pedido:", error);
    notFound();
  }
}
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";
import ProductoDetalle from "@/components/admin/productos/detalles/ProductoDetalle";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const producto = await prisma.productos.findUnique({
      where: { id: BigInt(id) },
      include: {
        variantes_producto: true,
        categorias:         true,
        ficha_tecnicas: {
          include: { medidas: { orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }] } },
        },
      },
    });

    if (!producto) notFound();

    const categorias = await prisma.categorias.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return (
      <ProductoDetalle
        producto={serializeBigInt(producto)}
        categorias={serializeBigInt(categorias)}
      />
    );
  } catch (error) {
    console.error("Error cargando producto:", error);
    notFound();
  }
}
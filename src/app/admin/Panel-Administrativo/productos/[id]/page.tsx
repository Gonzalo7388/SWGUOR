import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/productos/form/ProductForm";
import { prisma } from "@/lib/prisma"; 
import { serializeBigInt } from "@/lib/utils/serialize";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;

  try {
    // Buscamos el producto usando la instancia global
    const producto = await prisma.productos.findUnique({
      where: { id: BigInt(id) },
      include: {
        variantes_producto: true,
        categorias: true
      }
    });

    if (!producto) notFound();

    // Obtenemos las categorías
    const categorias = await prisma.categorias.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    // Serializamos (Usamos tu función serializeBigInt para mayor limpieza)
    const initialData = serializeBigInt(producto);
    const categoriasSerializadas = serializeBigInt(categorias);

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <ProductForm 
          mode="edit" 
          initialData={initialData} 
          categorias={categoriasSerializadas} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error cargando producto:", error);
    notFound();
  }
}
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/productos/form/ProductForm";
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  // 1. Buscamos el producto con sus variantes y categorías
  const producto = await prisma.productos.findUnique({
    where: { id: BigInt(params.id) },
    include: {
      variantes_producto: true,
      categorias: true
    }
  });

  if (!producto) notFound();

  // 2. Necesitamos las categorías para el select del form
  const categorias = await prisma.categorias.findMany();

  // 3. Serializamos para evitar errores de BigInt
  const initialData = JSON.parse(JSON.stringify(producto, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ProductForm 
        mode="edit" 
        initialData={initialData} 
        categorias={categorias} 
      />
    </div>
  );
}
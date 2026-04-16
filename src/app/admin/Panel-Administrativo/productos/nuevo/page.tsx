import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/productos/form/ProductForm"; 
import { ChevronLeft, PackagePlus } from "lucide-react";
import Link from "next/link";

export default async function NuevoProductoPage() {
  // 1. Obtenemos categorías
  const categorias = await prisma.categorias.findMany({
    orderBy: { nombre: 'asc' }
  });
  
  // 2. Obtenemos el ID del último producto para el SKU
  const ultimoProducto = await prisma.productos.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  const nextId = ultimoProducto ? Number(ultimoProducto.id) + 1 : 1;

  // Formateamos las categorías para evitar errores de serialización de BigInt
  const categoriasFormateadas = categorias.map(c => ({
    ...c,
    id: c.id.toString(),
    nombre: c.nombre
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ── Breadcrumb y Header ── */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/admin/Panel-Administrativo/productos" 
            className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors text-sm font-bold w-fit"
          >
            <ChevronLeft size={16} />
            VOLVER AL INVENTARIO
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-600 rounded-xl shadow-lg shadow-pink-200">
                <PackagePlus className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Producto</h1>
                <p className="text-gray-500 text-sm">
                  Añadir nueva mercadería al catálogo · Modas y Estilos GUOR
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contenedor del Formulario ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Decoración superior sutil */}
          <div className="h-1.5 bg-pink-600 w-full" />
          
          <div className="p-6 md:p-10">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                Información del Producto
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Completa todos los campos requeridos para el SKU #{nextId}
              </p>
            </div>

            <ProductForm 
              mode="create" 
              categorias={categoriasFormateadas} 
              nextId={nextId} 
            />
          </div>
        </div>

        {/* Footer informativo opcional */}
        <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Sistema de Gestión Interna
        </p>
      </div>
    </div>
  );
}
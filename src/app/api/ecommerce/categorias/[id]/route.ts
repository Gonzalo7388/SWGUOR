import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias/[id]
 * Obtiene todos los productos de una categoría específica
 * Incluye información de la categoría y sus productos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoriaId } = await params;
    const id = parseInt(categoriaId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }

    // Obtener la categoría
    const categoria = await prisma.categorias.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
    });

    if (!categoria || !categoria.activo) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todos los productos de la categoría
    const productos = await prisma.productos.findMany({
      where: {
        categoria_id: id,
        estado: 'activo',
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        imagen: true,
        sku: true,
        stock: true,
        categoria_id: true,
        estado: true,
        created_at: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Transformar los datos
    const productosTransformados = productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio),
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
      },
    }));

    return NextResponse.json({
      success: true,
      data: productosTransformados,
      categoria,
      count: productosTransformados.length,
    });
  } catch (error) {
    console.error('[API] Error obteniendo productos de categoría:', error);
    return NextResponse.json(
      { error: 'Error obteniendo productos de la categoría' },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/productos/por-categoria
 * Obtiene productos agrupados por categoría
 * Útil para mostrar productos por categoría en la página principal o listados
 * Parámetros:
 * - limite_por_categoria: Productos a mostrar por cada categoría (default: 6)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitePorCategoria = parseInt(
      searchParams.get('limite_por_categoria') || '6'
    );

    // Obtener todas las categorías activas
    const categorias = await prisma.categorias.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Para cada categoría, obtener sus productos
    const categoriasConProductos = await Promise.all(
      categorias.map(async (categoria) => {
        const productos = await prisma.productos.findMany({
          where: {
            categoria_id: categoria.id,
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
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limitePorCategoria,
        });

        return {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          productos: productos.map((p) => ({
            ...p,
            precio: Number(p.precio),
          })),
          total_productos: await prisma.productos.count({
            where: {
              categoria_id: categoria.id,
              estado: 'activo',
            },
          }),
        };
      })
    );

    // Filtrar categorías que tengan productos
    const categoriasConProductosActivos = categoriasConProductos.filter(
      (cat) => cat.productos.length > 0
    );

    return NextResponse.json({
      success: true,
      data: categoriasConProductosActivos,
      total_categorias: categoriasConProductosActivos.length,
    });
  } catch (error) {
    console.error('[API] Error obteniendo productos por categoría:', error);
    return NextResponse.json(
      {
        error: 'Error obteniendo productos agrupados por categoría',
      },
      { status: 500 }
    );
  }
}

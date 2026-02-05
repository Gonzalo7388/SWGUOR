import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/productos
 * Obtiene productos para el ecommerce con filtros
 * Parámetros:
 * - categoria_id: ID de la categoría (para filtrar)
 * - busqueda: Búsqueda por nombre o descripción
 * - limite: Cantidad máxima de resultados (default: 20)
 * - estado: Estado del producto (default: activo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoria_id');
    const busqueda = searchParams.get('busqueda');
    const limite = parseInt(searchParams.get('limite') || '20');
    const estado = searchParams.get('estado') || 'activo';

    // Construir filtros dinámicos
    const where: any = {
      estado: estado,
      categoria: {
        activo: true,
      },
    };

    if (categoriaId) {
      where.categoria_id = parseInt(categoriaId);
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    // Obtener productos con relación de categoría
    const productos = await prisma.productos.findMany({
      where,
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limite,
    });

    // Transformar datos para el ecommerce
    const productosTransformados = productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      sku: producto.sku,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
      categoria: {
        id: producto.categoria.id,
        nombre: producto.categoria.nombre,
      },
      estado: producto.estado,
      created_at: producto.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: productosTransformados,
      count: productosTransformados.length,
    });
  } catch (error) {
    console.error('[API] Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo productos del ecommerce' },
      { status: 500 }
    );
  }
}

import { createClient as createServerClient } from '@supabase/supabase-js';
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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Obtener todas las categorías activas
    const { data: categorias, error: categError } = await supabase
      .from('categorias')
      .select('id, nombre, descripcion, activo')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (categError || !categorias) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo categorías',
          data: [],
        },
        { status: 500 }
      );
    }

    // Para cada categoría, obtener sus productos
    const categoriasConProductos = await Promise.all(
      (categorias as any[]).map(async (categoria) => {
        // Obtener productos de la categoría
        const { data: productos, error: prodError } = await supabase
          .from('productos')
          .select('id, nombre, descripcion, precio, imagen, sku, stock, stock_minimo, categoria_id, created_at, updated_at')
          .eq('categoria_id', categoria.id)
          .eq('estado', 'activo')
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(limitePorCategoria);

        // Contar total de productos en la categoría
        const { count: totalProductos } = await supabase
          .from('productos')
          .select('id', { count: 'exact', head: true })
          .eq('categoria_id', categoria.id)
          .eq('estado', 'activo')
          .gt('stock', 0);

        // Normalizar URLs de imagen
        const normalizarImagen = (imagen: string | null | undefined): string | null => {
          if (!imagen) return null;
          if (imagen.startsWith('http')) return imagen;
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${imagen}`;
        };

        return {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          productos: ((productos || []) as any[]).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: Number(p.precio),
            imagen: normalizarImagen(p.imagen),
            sku: p.sku,
            stock: p.stock,
            stock_minimo: p.stock_minimo,
            categoria_id: p.categoria_id,
            created_at: p.created_at,
            updated_at: p.updated_at,
          })),
          total_productos: totalProductos || 0,
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
        success: false,
        error: 'Error obteniendo productos agrupados por categoría',
        data: [],
      },
      { status: 500 }
    );
  }
}


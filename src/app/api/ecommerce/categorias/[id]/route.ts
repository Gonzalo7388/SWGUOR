import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias/[id]
 * Obtiene todos los productos de una categoría específica
 * Incluye información de la categoría y sus productos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }

    // Usar cliente de servicio para acceso sin restricciones
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

    // Obtener la categoría
    const { data: categoria, error: categError } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (categError || !categoria) {
      console.error('[API] Categoría no encontrada:', categError);
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todos los productos de la categoría (solo activos)
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', id)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    if (prodError) {
      console.error('[API] Error obteniendo productos:', prodError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo productos de la categoría',
          data: [],
        },
        { status: 500 }
      );
    }

    // Normalizar URLs de imagen
    const normalizarImagen = (imagen: string | null | undefined): string | null => {
      if (!imagen) return null;
      if (imagen.startsWith('http')) return imagen;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${imagen}`;
    };

    // Transformar los datos
    const productosTransformados = (productos || []).map((producto: any) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      precio_original: producto.precio_original ? Number(producto.precio_original) : undefined,
      imagen: normalizarImagen(producto.imagen),
      sku: producto.sku,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id,
      created_at: producto.created_at,
      updated_at: producto.updated_at,
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
      {
        success: false,
        error: 'Error obteniendo productos de la categoría',
        data: [],
      },
      { status: 500 }
    );
  }
}

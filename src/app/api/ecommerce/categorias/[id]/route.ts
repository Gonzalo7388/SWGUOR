import { createClient} from '@/lib/supabase/server';
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

    const supabase = await createClient();

    // Obtener la categoría
    const { data: categoria, error: categError } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .eq('estado', true)
      .single();

    if (categError || !categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todos los productos de la categoría (solo activos y con stock)
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, precio, imagen, sku, stock, stock_minimo, categoria_id, created_at, updated_at')
      .eq('categoria_id', id)
      .eq('estado', 'activo')
      .gt('stock', 0)
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

    // Transformar los datos
    const productosTransformados = (productos || []).map((producto: any) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      imagen: producto.imagen,
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

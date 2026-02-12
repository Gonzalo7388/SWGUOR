import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/productos
 * Obtiene productos para el ecommerce con filtros
 * Parámetros:
 * - categoria_id: ID de la categoría (para filtrar)
 * - busqueda: Búsqueda por nombre o descripción
 * - limite: Cantidad máxima de resultados (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoria_id');
    const busqueda = searchParams.get('busqueda');
    const limite = parseInt(searchParams.get('limite') || '50');

    // Usar cliente de servicio para acceso público
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

    let query = supabase
      .from('productos')
      .select('*')
      .eq('estado', 'activo')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(limite);

    // Filtrar por categoría si se proporciona
    if (categoriaId) {
      query = query.eq('categoria_id', parseInt(categoriaId));
    }

    const { data: productos, error } = await query;

    if (error) {
      console.error('[API] Error obteniendo productos:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo productos',
          data: [],
        },
        { status: 500 }
      );
    }

    let productosResultado = (productos || []) as any[];

    // Filtro por búsqueda (cliente-side si es necesario)
    if (busqueda) {
      const busquedaBaja = busqueda.toLowerCase();
      productosResultado = productosResultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaBaja) ||
          p.descripcion?.toLowerCase().includes(busquedaBaja) ||
          p.sku?.toLowerCase().includes(busquedaBaja)
      );
    }

    // Obtener categorías para enriquecer los datos
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('estado', 'activo');

    const categoriasMap = new Map(
      (categorias || []).map((c: any) => [c.id, c])
    );

    // Transformar los datos
    const productosTransformados = productosResultado.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      sku: producto.sku,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id,
      categoria: categoriasMap.get(producto.categoria_id) || {
        id: producto.categoria_id,
        nombre: 'Sin categoría',
      },
      created_at: producto.created_at,
      updated_at: producto.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: productosTransformados,
      count: productosTransformados.length,
    });
  } catch (error) {
    console.error('[API] Error obteniendo productos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo productos',
        data: [],
      },
      { status: 500 }
    );
  }
}

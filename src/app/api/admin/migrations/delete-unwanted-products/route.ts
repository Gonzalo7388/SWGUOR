import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/migrations/delete-unwanted-products
 * Elimina definitivamente productos de categorías no deseadas
 */
export async function POST(request: NextRequest) {
  try {
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

    // Categorías donde elimaremos todos los productos
    const categoriasAEliminar = [
      'Accesorios',
      'Prendas Deportivas',
      'Suéteres',
      'Conjuntos',
      'Blusas y Camisas',
      'Pantalones y Jeans',
    ];

    // Obtener todas las categorías (incluyendo inactivas)
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id, nombre')
      .in('nombre', categoriasAEliminar);

    if (!categorias || categorias.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay categorías a eliminar',
        productosEliminados: 0,
      });
    }

    const idsACategorias = categorias.map((c: any) => c.id);
    let totalEliminados = 0;

    // Eliminar productos de cada categoría
    for (const categId of idsACategorias) {
      const { data: productos } = await supabase
        .from('productos')
        .select('id')
        .eq('categoria_id', categId);

      if (productos && productos.length > 0) {
        const ids = productos.map((p: any) => p.id);
        const { error } = await supabase
          .from('productos')
          .delete()
          .in('id', ids);

        if (!error) {
          totalEliminados += ids.length;
          console.log(`✓ ${ids.length} productos eliminados`);
        }
      }
    }

    // Marcar categorías como inactivas
    const { error: updateError } = await supabase
      .from('categorias')
      .update({ estado: 'inactivo' })
      .in('id', idsACategorias);

    return NextResponse.json({
      success: true,
      message: 'Productos eliminados',
      productosEliminados: totalEliminados,
      categoriasInactivadas: idsACategorias.length,
    });
  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar productos',
      },
      { status: 500 }
    );
  }
}

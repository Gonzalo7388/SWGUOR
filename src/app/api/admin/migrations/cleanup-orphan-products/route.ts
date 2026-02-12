import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/migrations/cleanup-orphan-products
 * Elimina productos sin categoría válida
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

    // Obtener categorías activas válidas
    const { data: categoriasValidas } = await supabase
      .from('categorias')
      .select('id')
      .eq('estado', 'activo');

    const idsValidos = (categoriasValidas || []).map((c: any) => c.id);

    // Encontrar productos cuya categoría no está en la lista de válidas
    const { data: productosOrfanos } = await supabase
      .from('productos')
      .select('id')
      .not('categoria_id', 'in', `(${idsValidos.join(',')})`);

    if (!productosOrfanos || productosOrfanos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay productos huérfanos',
        productosEliminados: 0,
      });
    }

    const idsAEliminar = productosOrfanos.map((p: any) => p.id);

    // Eliminar productos huérfanos
    const { error } = await supabase
      .from('productos')
      .delete()
      .in('id', idsAEliminar);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Productos huérfanos eliminados',
      productosEliminados: idsAEliminar.length,
    });
  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar productos huérfanos',
      },
      { status: 500 }
    );
  }
}

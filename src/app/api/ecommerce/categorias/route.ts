import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias
 * Obtiene todas las categorías activas para el ecommerce
 */
export async function GET(request: NextRequest) {
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

    // Obtener todas las categorías activas
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, descripcion, activo, created_at, updated_at')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('[API] Error obteniendo categorías:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo categorías',
          data: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo categorías',
        data: [],
      },
      { status: 500 }
    );
  }
}

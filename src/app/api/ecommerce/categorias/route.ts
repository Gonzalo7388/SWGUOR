import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias
 * Obtiene todas las categorías activas para el ecommerce
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Obtener todas las categorías activas de tipo 'producto'
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, descripcion, tipo_categoria, estado, created_at, updated_at')
      .eq('estado', 'activo')
      .eq('tipo_categoria', 'producto')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error obteniendo categorías:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo categorías',
          data: [],
        },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} categorías activas para ecommerce`);
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    }
  );
  } catch (error: any) {
    console.error('Error fetching ecommerce categorias:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo categorías',
        data: [],
      },
      { status: 500 }
    );
  }
}
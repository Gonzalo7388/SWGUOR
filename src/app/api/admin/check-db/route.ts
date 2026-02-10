import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Obtener todos los productos sin filtros
    const { data: allProducts, error: prodError } = await supabase
      .from('productos')
      .select('id, nombre, estado, stock, stock_minimo')
      .limit(50);

    if (prodError) throw prodError;

    // Contar por estado
    const productosPorEstado = {
      activos: allProducts?.filter((p: any) => p.estado === 'activo').length || 0,
      inactivos: allProducts?.filter((p: any) => p.estado === 'inactivo').length || 0,
      otros: allProducts?.filter((p: any) => p.estado !== 'activo' && p.estado !== 'inactivo').length || 0,
    };

    return NextResponse.json({
      totalProductos: allProducts?.length || 0,
      productosPorEstado,
      primeros10: allProducts?.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: 500 }
    );
  }
}

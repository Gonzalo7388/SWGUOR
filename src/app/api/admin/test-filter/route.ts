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

    // Exactamente igual que el API
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, precio, imagen, sku, stock, stock_minimo, categoria_id, created_at, estado')
      .eq('estado', 'activo')
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      totalProductosConFiltro: productos?.length || 0,
      productos: productos?.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = await createClient();

    // Obtener todas las categorías (sin filtro)
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .limit(5);

    // Obtener todos los productos (sin filtro)
    const { data: productos } = await supabase
      .from('productos')
      .select('id, nombre, estado, stock')
      .limit(5);

    // Obtener estado de productos por estado
    const estadosUnicos = await supabase
      .from('productos')
      .select('estado');

    return NextResponse.json({
      categorias: {
        count: categorias?.length || 0,
        data: categorias || [],
      },
      productos: {
        count: productos?.length || 0,
        data: productos || [],
        estadosUnicos: [...new Set((estadosUnicos?.data || []).map((p: any) => p.estado))],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

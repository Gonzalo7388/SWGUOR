import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente público (sin auth) — solo lectura de datos públicos
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feedback_cliente')
      .select(`
        id,
        puntuacion,
        comentario,
        created_at,
        clientes ( nombre_comercial )
      `)
      .eq('tipo_feedback', 'positivo')
      .eq('estado', 'revisado')
      .gte('puntuacion', 4)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Validar que data sea un array antes de enviar
    if (!Array.isArray(data)) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, {
      headers: {
        // Cache 1 hora en CDN, revalida en background
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[GET /api/landing/testimonios]', err);
    return NextResponse.json([], { status: 500 });
  }
}
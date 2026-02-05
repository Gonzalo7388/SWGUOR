import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Obtener todas las categorías activas
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('[API] Error obteniendo categorías:', error);
      return NextResponse.json(
        { error: 'Error obteniendo categorías' },
        { status: 500 }
      );
    }

    // Normalizar los datos
    const categoriasNormalizadas = (data || []).map((categoria: any) => ({
      id: categoria.Identificon || categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.Descripción,
      activo: categoria.activo,
      imagen: categoria.imagen,
      creado_en: categoria.creado_en,
      actualizado_en: categoria.actualizado_en,
    }));

    return NextResponse.json({
      success: true,
      data: categoriasNormalizadas,
      count: categoriasNormalizadas.length,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

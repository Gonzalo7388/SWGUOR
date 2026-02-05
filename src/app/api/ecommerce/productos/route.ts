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

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const busqueda = searchParams.get('busqueda');
    const limite = searchParams.get('limite') || '20';

    let query = supabase.from('productos').select('*');

    // Aplicar filtros
    if (categoria) {
      query = query.eq('id_de_categoria', categoria);
    }

    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,Descripción.ilike.%${busqueda}%`);
    }

    // Aplicar límite y ordenamiento
    const { data, error } = await query
      .order('creado_en', { ascending: false })
      .limit(parseInt(limite));

    if (error) {
      console.error('[API] Error obteniendo productos:', error);
      return NextResponse.json(
        { error: 'Error obteniendo productos' },
        { status: 500 }
      );
    }

    // Normalizar los datos
    const productosNormalizados = (data || []).map((producto: any) => ({
      id: producto.Identificon || producto.id,
      nombre: producto.nombre,
      descripcion: producto.Descripción,
      precio: producto.precio,
      precio_original: producto.precio_original,
      categoria_id: producto['id_de_categoria'],
      imagen: producto.Imagen,
      creado_en: producto.creado_en,
      existencias: producto.existencias,
      stock_minimo: producto.stock_minimo,
    }));

    return NextResponse.json({
      success: true,
      data: productosNormalizados,
      count: productosNormalizados.length,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

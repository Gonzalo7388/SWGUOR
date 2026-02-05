import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
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

    // Obtener productos de una categoría específica
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id_de_categoria', id)
      .order('nombre', { ascending: true });

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

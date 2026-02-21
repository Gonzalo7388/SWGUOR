import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias/[id]
 * Obtiene todos los productos de una categoría específica
 * Incluye información de la categoría y sus productos normalizados
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // En Next.js 14/15, params puede ser una promesa
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de categoría inválido' },
        { status: 400 }
      );
    }

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

    // 1. Obtener la categoría
    const { data: categoria, error: categError } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (categError || !categoria) {
      console.error('[API] Categoría no encontrada:', categError);
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // 2. Obtener todos los productos de la categoría (solo activos)
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', id)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    if (prodError) {
      console.error('[API] Error obteniendo productos:', prodError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error obteniendo productos de la categoría',
          data: [],
        },
        { status: 500 }
      );
    }

    /**
     * Helper para normalizar imágenes del bucket de Supabase
     * Ahora detecta si la ruta ya incluye el nombre del bucket o si es una URL externa
     */
    const getFullImageUrl = (path: string | null, bucket: string = 'productos'): string | null => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      
      // Si el path ya contiene el nombre del bucket (ej: "categorias/foto.jpg"), lo usamos directamente
      const cleanPath = path.includes('/') ? path : `${bucket}/${path}`;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    };

    // 3. Transformar los datos para el Frontend
    const productosTransformados = (productos || []).map((producto: any) => ({
      ...producto,
      precio: Number(producto.precio),
      precio_original: producto.precio_original ? Number(producto.precio_original) : undefined,
      imagen: getFullImageUrl(producto.imagen, 'productos'),
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        imagen: getFullImageUrl(categoria.imagen, 'categorias')
      },
    }));

    // Normalizamos también la imagen de la categoría principal en la respuesta
    const categoriaNormalizada = {
      ...categoria,
      imagen: getFullImageUrl(categoria.imagen, 'categorias')
    };

    return NextResponse.json({
      success: true,
      data: productosTransformados,
      categoria: categoriaNormalizada,
      count: productosTransformados.length,
    });

  } catch (error) {
    console.error('[API] Error crítico:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        data: [],
      },
      { status: 500 }
    );
  }
}
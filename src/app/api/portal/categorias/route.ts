import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/categorias
 * Obtiene todas las categorías activas para el ecommerce con URLs de imagen normalizadas
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Obtener todas las categorías donde 'activo' es true
    // Agregamos 'imagen' y 'orden' a la consulta
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('id, nombre, descripcion, activo, imagen, orden, created_at, updated_at')
      .eq('activo', true)
      .order('orden', { ascending: true }) // Ordenamos por el campo orden que creamos
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

    /**
     * Helper para normalizar la URL de la imagen de categoría
     */
    const getFullImageUrl = (path: string | null): string | null => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      
      // Si el path no tiene el prefijo del bucket, lo agregamos
      const cleanPath = path.startsWith('categorias/') ? path : `categorias/${path}`;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    };

    // 2. Transformar los datos para incluir la URL completa de la imagen
    const categoriasTransformadas = (categorias || []).map((cat: any) => ({
      ...cat,
      imagen: getFullImageUrl(cat.imagen)
    }));

    console.log(`[API] Se enviaron ${categoriasTransformadas.length} categorías al catálogo`);
    
    return NextResponse.json({
      success: true,
      data: categoriasTransformadas,
      count: categoriasTransformadas.length,
    },
    {
      headers: {
        // Cache de 5 minutos en el edge para mejorar performance de carga masiva
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    }
  );
  } catch (error: any) {
    console.error('[API] Error crítico en categorias route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
        data: [],
      },
      { status: 500 }
    );
  }
}
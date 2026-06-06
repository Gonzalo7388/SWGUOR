export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

const normalizarImagen = (
  img: string | null | undefined,
  bucket = 'categorias'
): string | null => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const cleanPath = img.includes('/') ? img : `${bucket}/${img}`;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
};

/**
 * GET /api/portal/categorias
 * Todas las categorías activas con imágenes normalizadas desde Prisma.
 */
export async function GET() {
  try {
    const categorias = await prisma.categorias_productos.findMany({
      where: { activo: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });

    const data = categorias.map((cat) => ({
      ...serializeBigInt(cat),
      imagen: normalizarImagen(cat.imagen),
    }));

    return NextResponse.json(
      { success: true, data, count: data.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('[Portal] Error en GET categorias:', error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

/**
 * Normalizar imagen de Supabase Storage
 */
const normalizarImagen = (
  img: string | null | undefined,
  bucket = 'productos'
): string | null => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const cleanPath = img.includes('/') ? img : `${bucket}/${img}`;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
};

// Orden canónico de tallas
const ORDEN_TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34'];
const ordenarTallas = (tallas: string[]) =>
  [...tallas].sort(
    (a, b) => ORDEN_TALLAS.indexOf(a) - ORDEN_TALLAS.indexOf(b)
  );

/**
 * GET /api/portal/categorias/[id]
 * Detalle de categoría + productos activos con variantes.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoriaId = BigInt(resolvedParams.id);

    // ── 1. Categoría ──
    const categoria = await prisma.categorias.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // ── 2. Productos activos de la categoría con variantes ──
    const productos = await prisma.productos.findMany({
      where: { categoria_id: categoriaId, estado: 'activo' },
      include: {
        variantes_producto: {
          where: { estado: 'activo', stock_adicional: { gt: 0 } },
          select: {
            id: true,
            color: true,
            talla: true,
            stock_adicional: true,
            precio_adicional: true,
            sku: true,
            imagen_url: true,
          },
          orderBy: [{ talla: 'asc' }, { color: 'asc' }],
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // ── 3. Transformar productos ──
    const imagenCategoria = normalizarImagen(categoria.imagen, 'categorias');

    const data = productos.map((producto) => {
      const variantes = producto.variantes_producto;

      const coloresDisponibles = [
        ...new Set(variantes.map((v) => v.color)),
      ] as string[];

      const tallasDisponibles = ordenarTallas([
        ...new Set(variantes.map((v) => v.talla)),
      ] as string[]);

      // Tallas por color
      const tallasPorColor: Record<string, string[]> = {};
      for (const v of variantes) {
        if (!tallasPorColor[v.color]) tallasPorColor[v.color] = [];
        if (!tallasPorColor[v.color].includes(v.talla)) {
          tallasPorColor[v.color].push(v.talla);
        }
      }
      for (const color in tallasPorColor) {
        tallasPorColor[color] = ordenarTallas(tallasPorColor[color]);
      }

      // Colores por talla
      const coloresPorTalla: Record<string, string[]> = {};
      for (const v of variantes) {
        if (!coloresPorTalla[v.talla]) coloresPorTalla[v.talla] = [];
        if (!coloresPorTalla[v.talla].includes(v.color)) {
          coloresPorTalla[v.talla].push(v.color);
        }
      }

      const stockTotal = variantes.reduce(
        (sum, v) => sum + v.stock_adicional,
        0
      );

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      return {
        ...serializeBigInt(producto),
        precio: Number(producto.precio),
        imagen: normalizarImagen(producto.imagen),
        stock_disponible: stockTotal,
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          imagen: imagenCategoria,
        },
        es_nuevo: producto.created_at >= fechaLimite,
        colores_disponibles: coloresDisponibles,
        tallas_disponibles: tallasDisponibles,
        tallas_por_color: tallasPorColor,
        colores_por_talla: coloresPorTalla,
        variantes: variantes.map((v) => ({
          id: v.id,
          color: v.color,
          talla: v.talla,
          stock: v.stock_adicional,
          precio_adicional: Number(v.precio_adicional),
          sku: v.sku,
          imagen_url: v.imagen_url
            ? normalizarImagen(v.imagen_url)
            : normalizarImagen(producto.imagen),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data,
      categoria: {
        ...serializeBigInt(categoria),
        imagen: imagenCategoria,
      },
      count: data.length,
    });
  } catch (error: any) {
    console.error('[Portal] Error en GET categoria detalle:', error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Orden canónico de tallas
const ORDEN_TALLAS = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34'];
const ordenarTallas = (tallas: string[]) =>
  [...tallas].sort((a, b) => {
    const ia = ORDEN_TALLAS.indexOf(a);
    const ib = ORDEN_TALLAS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Validar ID ──
    const resolvedParams = await params;
    const productoId = parseInt(resolvedParams.id);

    if (isNaN(productoId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // ── 2. Cliente Supabase ──
    const supabase = await createClient();

    // ── 3. Producto base ──
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .single();

    if (errorProducto || !producto) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    if (producto.estado?.toLowerCase().trim() !== 'activo') {
      return NextResponse.json({ success: false, error: 'Producto no disponible' }, { status: 403 });
    }

    // ── 4. Consultas paralelas ──
    const [variantesRes, categoriaRes] = await Promise.all([
      supabase
        .from('variantes_producto')
        .select('*')
        .eq('producto_id', productoId),
      supabase
        .from('categorias')
        .select('nombre')
        .eq('id', producto.categoria_id)
        .maybeSingle(),
    ]);

    const variantesRaw = variantesRes.data || [];
    const categoriaData = categoriaRes.data;

    // ── 5. Normalización de imágenes ──
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const normalizarImagen = (img: string | null | undefined): string | null => {
      if (!img) return null;
      if (img.startsWith('http')) return img;
      return `${baseUrl}/storage/v1/object/public/productos/${img}`;
    };

    const imagenPrincipal = normalizarImagen(producto.imagen);

    // ── 6. Procesar variantes ──
    const variantesTransformadas = variantesRaw.map((v) => ({
      id: v.id,
      color: v.color as string,
      talla: v.talla as string,
      estado: v.estado as string,
      precio_adicional: Number(v.precio_adicional || 0),
      stock_adicional: Number(v.stock_adicional || 0),
      sku: v.sku,
      imagen_url: normalizarImagen(v.imagen_url) || imagenPrincipal,
    }));

    // Solo variantes con stock para los selectores
    const variantesActivas = variantesTransformadas.filter(
      (v) => v.estado === 'activo' && v.stock_adicional > 0
    );

    // ── 7. Colores y tallas disponibles (con stock) ──
    const coloresDisponibles = [
      ...new Set(variantesActivas.map((v) => v.color).filter(Boolean)),
    ] as string[];

    const tallasDisponibles = ordenarTallas([
      ...new Set(variantesActivas.map((v) => v.talla).filter(Boolean)),
    ] as string[]);

    // ── 8. Mapas de filtrado cruzado ──
    // color → tallas disponibles para ese color
    const tallasPorColor: Record<string, string[]> = {};
    for (const v of variantesActivas) {
      if (!tallasPorColor[v.color]) tallasPorColor[v.color] = [];
      if (!tallasPorColor[v.color].includes(v.talla))
        tallasPorColor[v.color].push(v.talla);
    }
    for (const color in tallasPorColor) {
      tallasPorColor[color] = ordenarTallas(tallasPorColor[color]);
    }

    // talla → colores disponibles para esa talla
    const coloresPorTalla: Record<string, string[]> = {};
    for (const v of variantesActivas) {
      if (!coloresPorTalla[v.talla]) coloresPorTalla[v.talla] = [];
      if (!coloresPorTalla[v.talla].includes(v.color))
        coloresPorTalla[v.talla].push(v.color);
    }

    // ── 9. Respuesta final ──
    return NextResponse.json({
      success: true,
      data: {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        imagen: imagenPrincipal,
        sku: producto.sku,
        stock: producto.stock,
        estado: producto.estado,
        destacado: producto.destacado,
        categoria_id: producto.categoria_id,
        categoria: {
          id: producto.categoria_id,
          nombre: categoriaData?.nombre || 'General',
        },
        created_at: producto.created_at,
        updated_at: producto.updated_at,
        colores_disponibles: coloresDisponibles,
        tallas_disponibles: tallasDisponibles,
        tallas_por_color: tallasPorColor,
        colores_por_talla: coloresPorTalla,
        variantes: variantesTransformadas,
      },
    });
  } catch (error: any) {
    console.error('[API ERROR]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
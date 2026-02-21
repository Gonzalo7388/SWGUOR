import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/productos
 * Obtiene productos para el ecommerce con filtros
 * Parámetros:
 * - categoria_id: ID de la categoría
 * - busqueda: Búsqueda por nombre, descripción o SKU
 * - color: Filtro por color (ColorPrenda)
 * - talla: Filtro por talla (TallaProductos)
 * - limite: Cantidad máxima de resultados (default: 50)
 * - nuevo: Si es "true", filtra productos recién añadidos
 * - dias: Días hacia atrás para considerar "nuevo" (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoria_id');
    const busqueda = searchParams.get('busqueda');
    const colorFiltro = searchParams.get('color');
    const tallaFiltro = searchParams.get('talla');
    const limite = parseInt(searchParams.get('limite') || '50');
    const soloNuevos = searchParams.get('nuevo') === 'true';
    const dias = parseInt(searchParams.get('dias') || '30');

    const supabase = await createClient();

    // ── 1. Si hay filtro de color o talla, obtener los producto_ids válidos ──
    let productoIdsFiltrados: number[] | null = null;

    if (colorFiltro || tallaFiltro) {
      let variantesQuery = supabase
        .from('variantes_producto')
        .select('producto_id')
        .eq('estado', 'activo')
        .gt('stock_adicional', 0);

      if (colorFiltro) variantesQuery = variantesQuery.eq('color', colorFiltro);
      if (tallaFiltro) variantesQuery = variantesQuery.eq('talla', tallaFiltro);

      const { data: variantesFiltradas, error: errorVariantes } = await variantesQuery;

      if (errorVariantes) {
        console.error('[API] Error filtrando variantes:', errorVariantes);
        return NextResponse.json(
          { success: false, error: 'Error filtrando variantes', data: [] },
          { status: 500 }
        );
      }

      productoIdsFiltrados = [
        ...new Set((variantesFiltradas || []).map((v) => v.producto_id)),
      ];

      if (productoIdsFiltrados.length === 0) {
        return NextResponse.json({ success: true, data: [], count: 0 });
      }
    }

    // ── 2. Query principal incluyendo variantes activas ──
    let query = supabase
      .from('productos')
      .select(`
        *,
        variantes_producto (
          id,
          color,
          talla,
          estado,
          stock_adicional,
          precio_adicional,
          sku,
          imagen_url
        )
      `)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false })
      .limit(limite);

    if (categoriaId) query = query.eq('categoria_id', parseInt(categoriaId));
    if (productoIdsFiltrados) query = query.in('id', productoIdsFiltrados);

    // ── Filtro de productos nuevos (últimos N días) ──
    if (soloNuevos) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);
      query = query.gte('created_at', fechaLimite.toISOString());
    }

    const { data: productos, error } = await query;

    if (error) {
      console.error('[API] Error obteniendo productos:', error);
      return NextResponse.json(
        { success: false, error: 'Error obteniendo productos', data: [] },
        { status: 500 }
      );
    }

    let productosResultado = (productos || []) as any[];

    // ── 3. Filtro por búsqueda ──
    if (busqueda) {
      const busquedaBaja = busqueda.toLowerCase();
      productosResultado = productosResultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaBaja) ||
          p.descripcion?.toLowerCase().includes(busquedaBaja) ||
          p.sku?.toLowerCase().includes(busquedaBaja)
      );
    }

    // ── 4. Categorías para enriquecer ──
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('estado', 'activo');

    const categoriasMap = new Map(
      (categorias || []).map((c: any) => [c.id, c])
    );

    // ── 5. Normalizar URL de imagen ──
    const normalizarImagen = (imagen: string | null | undefined): string | null => {
      if (!imagen) return null;
      if (imagen.startsWith('http')) return imagen;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${imagen}`;
    };

    // ── 6. Orden canónico de tallas ──
    const ORDEN_TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34'];
    const ordenarTallas = (tallas: string[]) =>
      [...tallas].sort(
        (a, b) => ORDEN_TALLAS.indexOf(a) - ORDEN_TALLAS.indexOf(b)
      );

    // ── 7. Transformar productos ──
    const productosTransformados = productosResultado.map((producto) => {
      const todasVariantes: any[] = producto.variantes_producto || [];

      const variantesActivas = todasVariantes.filter(
        (v) => v.estado === 'activo' && v.stock_adicional > 0
      );

      const coloresDisponibles = [
        ...new Set(variantesActivas.map((v) => v.color)),
      ] as string[];

      const tallasDisponibles = ordenarTallas([
        ...new Set(variantesActivas.map((v) => v.talla)),
      ] as string[]);

      const tallasPorColor: Record<string, string[]> = {};
      for (const v of variantesActivas) {
        if (!tallasPorColor[v.color]) tallasPorColor[v.color] = [];
        if (!tallasPorColor[v.color].includes(v.talla)) {
          tallasPorColor[v.color].push(v.talla);
        }
      }
      for (const color in tallasPorColor) {
        tallasPorColor[color] = ordenarTallas(tallasPorColor[color]);
      }

      const coloresPorTalla: Record<string, string[]> = {};
      for (const v of variantesActivas) {
        if (!coloresPorTalla[v.talla]) coloresPorTalla[v.talla] = [];
        if (!coloresPorTalla[v.talla].includes(v.color)) {
          coloresPorTalla[v.talla].push(v.color);
        }
      }

      // Indica si el producto fue creado en los últimos 30 días
      const esNuevo = (() => {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        return new Date(producto.created_at) >= fechaLimite;
      })();

      return {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        imagen: normalizarImagen(producto.imagen),
        sku: producto.sku,
        stock: producto.stock,
        categoria_id: producto.categoria_id,
        categoria: categoriasMap.get(producto.categoria_id) || {
          id: producto.categoria_id,
          nombre: 'Sin categoría',
        },
        created_at: producto.created_at,
        updated_at: producto.updated_at,
        es_nuevo: esNuevo,
        // Datos de variantes
        colores_disponibles: coloresDisponibles,
        tallas_disponibles: tallasDisponibles,
        tallas_por_color: tallasPorColor,
        colores_por_talla: coloresPorTalla,
        variantes: variantesActivas.map((v) => ({
          id: v.id,
          color: v.color,
          talla: v.talla,
          stock: v.stock_adicional,
          precio_adicional: Number(v.precio_adicional),
          sku: v.sku,
          imagen_url: v.imagen_url ? normalizarImagen(v.imagen_url) : null,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: productosTransformados,
      count: productosTransformados.length,
      filtros_aplicados: {
        categoria_id: categoriaId ? parseInt(categoriaId) : null,
        color: colorFiltro,
        talla: tallaFiltro,
        busqueda: busqueda || null,
        nuevo: soloNuevos,
        dias: soloNuevos ? dias : null,
      },
    });
  } catch (error) {
    console.error('[API] Error obteniendo productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo productos', data: [] },
      { status: 500 }
    );
  }
}
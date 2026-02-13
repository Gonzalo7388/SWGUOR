import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ecommerce/productos/[id]
 * Obtiene detalles completos de un producto con todas sus variantes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = parseInt(params.id);

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

    // Obtener producto
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .eq('estado', 'activo')
      .single();

    if (errorProducto || !producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Obtener variantes del producto
    const { data: variantes, error: errorVariantes } = await supabase
      .from('variantes_producto')
      .select('*')
      .eq('producto_id', productoId)
      .eq('activo', true);

    if (errorVariantes) {
      console.error('[API] Error obteniendo variantes:', errorVariantes);
    }

    // Obtener categoría
    const { data: categoria } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', producto.categoria_id)
      .single();

    // Normalizar URL de imagen
    const normalizarImagen = (imagen: string | null | undefined): string | null => {
      if (!imagen) return null;
      if (imagen.startsWith('http')) return imagen;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${imagen}`;
    };

    // Preparar colores únicos
    const coloresUnicos = Array.from(new Set((variantes || []).map(v => v.color).filter(Boolean))) as string[];
    const tallasUnicas = Array.from(new Set((variantes || []).map(v => v.talla).filter(Boolean))) as string[];

    const productoTransformado = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      imagen: normalizarImagen(producto.imagen),
      sku: producto.sku,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id,
      categoria: categoria || { id: producto.categoria_id, nombre: 'Sin categoría' },
      variantes: (variantes || []).map(v => ({
        id: v.id,
        color: v.color,
        talla: v.talla,
        precio_adicional: Number(v.precio_adicional || 0),
        stock_adicional: v.stock_adicional || 0,
        sku: v.sku,
      })),
      colores: coloresUnicos,
      tallas: tallasUnicas,
      created_at: producto.created_at,
      updated_at: producto.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: productoTransformado,
    });
  } catch (error) {
    console.error('[API] Error obteniendo producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo producto' },
      { status: 500 }
    );
  }
}

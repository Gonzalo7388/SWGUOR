// src/app/api/ecommerce/productos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Usamos tu helper de servidor

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar ID
    const resolvedParams = await params; // Esperar a que Next.js resuelva los params
    const productoId = parseInt(resolvedParams.id);
    
    if (isNaN(productoId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // 2. Inicializar cliente (con await porque es el helper de servidor de Next.js)
    const supabase = await createClient();

    // 3. Obtener el producto base
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .single();

    if (errorProducto || !producto) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    // 4. Verificación de estado (Limpieza de strings)
    if (producto.estado?.toLowerCase().trim() !== 'activo') {
      return NextResponse.json({ success: false, error: 'Producto no disponible' }, { status: 403 });
    }

    // 5. Consultas paralelas (Mejora el tiempo de respuesta)
    const [variantesRes, categoriaRes] = await Promise.all([
      supabase.from('variantes_producto').select('*').eq('producto_id', productoId),
      supabase.from('categorias').select('nombre').eq('id', producto.categoria_id).maybeSingle()
    ]);

    const variantesRaw = variantesRes.data || [];
    const categoriaData = categoriaRes.data;

    // 6. Normalización de URLs de imágenes
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const normalizarImagen = (img: string | null) => {
      if (!img) return null;
      if (img.startsWith('http')) return img;
      return `${baseUrl}/storage/v1/object/public/productos/${img}`;
    };

    const imagenPrincipal = normalizarImagen(producto.imagen);

    // 7. Transformación y Herencia de datos
    const productoTransformado = {
      ...producto,
      precio: Number(producto.precio),
      imagen: imagenPrincipal,
      categoria: {
        id: producto.categoria_id,
        nombre: categoriaData?.nombre || 'General'
      },
      // Selectores para el frontend
      colores: Array.from(new Set(variantesRaw.map(v => v.color).filter(Boolean))),
      tallas: Array.from(new Set(variantesRaw.map(v => v.talla).filter(Boolean))),
      // Variantes con imagen heredada si está vacía
      variantes: variantesRaw.map(v => ({
        ...v,
        precio_adicional: Number(v.precio_adicional || 0),
        imagen_url: normalizarImagen(v.imagen_url) || imagenPrincipal 
      }))
    };

    return NextResponse.json({
      success: true,
      data: productoTransformado
    });

  } catch (error: any) {
    console.error('[API ERROR]:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
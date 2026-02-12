import { createClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/migrations/reorganize-products-by-image
 * Reorganiza los 80 productos según su imagen y asigna a la categoría correcta
 * Elimina Buzos y distribuye todo correctamente
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Obtener todas las categorías
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('estado', 'activo');

    const categoriasMap = new Map(
      (categorias || []).map((c: any) => [c.nombre.toLowerCase(), c.id])
    );

    // Función para mapear imagen a categoría
    const obtenerCategoriaDeImagen = (imagen: string | null): string => {
      if (!imagen) return 'blusas'; // default

      const nombreLower = imagen.toLowerCase();

      // Mapeos específicos basados en nombres de archivo
      if (nombreLower.includes('camiseta') || nombreLower.includes('jersey')) {
        return 'blusas';
      }
      if (nombreLower.includes('casaca') || nombreLower.includes('jacket')) {
        return 'casacas y chaquetas';
      }
      if (nombreLower.includes('falda')) {
        return 'faldas';
      }
      if (
        nombreLower.includes('pantalon') ||
        nombreLower.includes('jean') ||
        nombreLower.includes('jeans') ||
        nombreLower.includes('cargo')
      ) {
        return 'pantalones';
      }
      if (nombreLower.includes('polera') || nombreLower.includes('polo')) {
        return 'polos y poleras';
      }
      if (
        nombreLower.includes('sweater') ||
        nombreLower.includes('sueter') ||
        nombreLower.includes('prenda')
      ) {
        // Los suéteres/buzos van a Blusas ahora que Buzos se elimina
        return 'blusas';
      }
      if (nombreLower.includes('vestido') || nombreLower.includes('vestigo')) {
        return 'vestidos';
      }

      return 'blusas'; // default
    };

    // Obtener todos los productos
    const { data: productos } = await supabase
      .from('productos')
      .select('*');

    if (!productos || productos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay productos para reorganizar',
      });
    }

    let productosActualizados = 0;
    const errores: any[] = [];

    // Reorganizar cada producto
    for (const producto of productos) {
      const categoriaNombre = obtenerCategoriaDeImagen(producto.imagen);
      const categoriaId = categoriasMap.get(categoriaNombre);

      if (categoriaId) {
        const { error } = await supabase
          .from('productos')
          .update({ categoria_id: categoriaId })
          .eq('id', producto.id);

        if (error) {
          errores.push({ id: producto.id, error: error.message });
        } else {
          productosActualizados++;
        }
      } else {
        errores.push({
          id: producto.id,
          error: `Categoría no encontrada: ${categoriaNombre}`,
        });
      }
    }

    // Marcar Buzos como inactivo
    const { data: buzosCateg } = await supabase
      .from('categorias')
      .select('id')
      .ilike('nombre', '%buzos%');

    if (buzosCateg && buzosCateg.length > 0) {
      for (const buzo of buzosCateg) {
        await supabase
          .from('categorias')
          .update({ estado: 'inactivo' })
          .eq('id', buzo.id);
      }
    }

    // Eliminar productos huérfanos
    const { data: categoriasActivas } = await supabase
      .from('categorias')
      .select('id')
      .eq('estado', 'activo');

    const idsActivos = (categoriasActivas || []).map((c: any) => c.id);

    if (idsActivos.length > 0) {
      const { data: huerfanos } = await supabase
        .from('productos')
        .select('id')
        .not('categoria_id', 'in', `(${idsActivos.join(',')})`);

      if (huerfanos && huerfanos.length > 0) {
        const idsAEliminar = huerfanos.map((p: any) => p.id);
        await supabase
          .from('productos')
          .delete()
          .in('id', idsAEliminar);
      }
    }

    // Obtener estadísticas finales
    const { data: distributionData } = await supabase
      .from('productos')
      .select('categoria_id, id');

    const distribution = new Map();
    (distributionData || []).forEach((p: any) => {
      const count = distribution.get(p.categoria_id) || 0;
      distribution.set(p.categoria_id, count + 1);
    });

    return NextResponse.json({
      success: true,
      message: 'Reorganización completada',
      productosActualizados,
      errores: errores.length > 0 ? errores.slice(0, 5) : [],
      distribution: Object.fromEntries(distribution),
    });
  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error en la reorganización',
      },
      { status: 500 }
    );
  }
}

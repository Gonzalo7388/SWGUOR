import { createClient} from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/migrations/reorganize-categories
 * Reorganiza los productos en las categorías correctas
 * - Fusiona "Blusas y Camisas" con "Blusas"
 * - Fusiona "Pantalones y Jeans" con "Pantalones"
 * - Elimina productos de categorías no deseadas (Accesorios, etc)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Mapeo de categorías antiguas a nuevas
    const categoryMap = new Map([
      ['Blusas y Camisas', 'Blusas'],      // Fusionar
      ['Pantalones y Jeans', 'Pantalones'], // Fusionar
      ['Accesorios', null],                 // Eliminar productos
      ['Prendas Deportivas', null],         // Eliminar productos
      ['Suéteres', null],                   // Eliminar productos
      ['Conjuntos', null],                  // Eliminar productos
    ]);

    // Obtener todas las categorías
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('estado', 'activo');

    const categoriasMap = new Map(
      (categorias || []).map((c: any) => [c.nombre, c.id])
    );

    let productosActualizados = 0;
    let productosEliminados = 0;

    // Procesar cada mapeo
    for (const [oldCategory, newCategory] of categoryMap.entries()) {
      const oldCategoryId = categoriasMap.get(oldCategory);
      if (!oldCategoryId) continue;

      if (newCategory) {
        // Fusionar categorías
        const newCategoryId = categoriasMap.get(newCategory);
        if (!newCategoryId) continue;

        console.log(`Fusionando ${oldCategory} (${oldCategoryId}) a ${newCategory} (${newCategoryId})`);

        const { error: updateError } = await supabase
          .from('productos')
          .update({ categoria_id: newCategoryId })
          .eq('categoria_id', oldCategoryId);

        if (updateError) {
          console.error(`Error actualizando ${oldCategory}:`, updateError);
        } else {
          const { count } = await supabase
            .from('productos')
            .select('id', { count: 'exact', head: true })
            .eq('categoria_id', newCategoryId);
          const actualCount = count || 0;
          productosActualizados += actualCount;
          console.log(`✓ ${actualCount} productos en ${newCategory}`);
        }
      } else {
        // Eliminar productos de categorías no deseadas
        console.log(`Eliminando productos de ${oldCategory} (${oldCategoryId})`);
        
        const { data: productosAEliminar, count } = await supabase
          .from('productos')
          .select('id', { count: 'exact' })
          .eq('categoria_id', oldCategoryId);

        if (count && count > 0) {
          const ids = (productosAEliminar || []).map((p: any) => p.id);
          console.log(`Eliminando ${ids.length} productos...`);
          
          const { error: deleteError } = await supabase
            .from('productos')
            .delete()
            .in('id', ids);

          if (deleteError) {
            console.error(`Error eliminando productos de ${oldCategory}:`, deleteError);
          } else {
            productosEliminados += ids.length;
            console.log(`✓ ${ids.length} productos eliminados de ${oldCategory}`);
          }
        }
      }
    }

    // Eliminar categorías vacías/inactivas
    const { data: toDelete } = await supabase
      .from('categorias')
      .select('id, nombre')
      .in('id', Array.from(categoriasMap.values()).filter((id: any) => {
        for (const [name] of categoryMap) {
          if (categoriasMap.get(name) === id) return true;
        }
        return false;
      }));

    if (toDelete) {
      for (const cat of toDelete) {
        await supabase
          .from('categorias')
          .update({ estado: 'inactivo' })
          .eq('id', cat.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reorganización completada',
      productosActualizados,
      productosEliminados,
    });
  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error en la migración',
      },
      { status: 500 }
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { obtenerInsumos, crearInsumo, actualizarStockInsumo } from '@/lib/helpers/products-helpers';
import { NextResponse } from 'next/server';

// GET: Obtener inventario con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filtros = {
      tipo: searchParams.get('tipo') as any
    };

    const { data, error } = await obtenerInsumos(filtros.tipo);

    if (error) throw new Error(error);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Registrar un nuevo insumo o material
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validaciones básicas
    if (!body.nombre || typeof body.stock_actual !== 'number') {
      return NextResponse.json({ error: 'Nombre y Stock Inicial son obligatorios' }, { status: 400 });
    }

    const { data, error } = await crearInsumo({
      nombre: body.nombre,
      tipo: body.tipo,
      unidad_medida: body.unidad_medida,
      stock_actual: body.stock_actual,
      stock_minimo: body.stock_minimo || 0,
      categoria_id: body.categoria_id,
      producto_id: body.producto_id
    });

    if (error) throw new Error(error);

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un item del inventario
export async function DELETE(req: Request) {
  const supabase = await createClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await (supabase as any)
      .from('inventario')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw new Error(error.message);

    return NextResponse.json({ message: 'Item de inventario eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Editar stock de un item del inventario
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const body = await req.json();

    // Usar helper para actualizar stock
    const { success, error } = await actualizarStockInsumo(parseInt(id), body.stock_actual);

    if (error) throw new Error(error);

    if (!success) {
      return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 400 });
    }

    // Retornar el insumo actualizado
    const supabase = await createClient();
    const { data: updatedData } = await (supabase as any)
      .from('inventario')
      .select()
      .eq('id', parseInt(id))
      .single();

    return NextResponse.json(updatedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
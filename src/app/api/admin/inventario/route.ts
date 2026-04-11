import { createClient } from '@/lib/supabase/server';
import { obtenerInsumos, crearInsumo, actualizarStockInsumo } from '@/lib/helpers/productos-helpers';
import { NextResponse } from 'next/server';

// GET: Obtener todos los insumos
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    // Los helpers deben estar preparados para manejar el cliente de supabase
    const data = await obtenerInsumos(supabase); 
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear nuevo insumo
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    if (!body.nombre || typeof body.stock_actual !== 'number') {
      return NextResponse.json({ error: 'Nombre y Stock Inicial son obligatorios' }, { status: 400 });
    }

    const data = await crearInsumo(supabase, {
      nombre:          body.nombre,
      tipo:            body.tipo,
      unidad_medida:   body.unidad_medida,
      stock_actual:    body.stock_actual,
      stock_minimo:    body.stock_minimo ?? 0,
      precio_unitario: body.precio_unitario ?? null,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un insumo
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    // ELIMINADO: parseInt(id) -> El ID ahora es un String (UUID)
    const { error } = await supabase
      .from('insumo') // Asegúrate de que la tabla sea 'insumo' (singular) según tu SQL
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Item de inventario eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar stock
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const body = await req.json();

    // ELIMINADO: parseInt(id) -> Pasamos el ID como String directamente
    const { success, error } = await actualizarStockInsumo(supabase, id, body.stock_actual);

    if (error) throw new Error(error);
    if (!success) return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 400 });

    const { data: updatedData, error: fetchError } = await supabase
      .from('insumo')
      .select()
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
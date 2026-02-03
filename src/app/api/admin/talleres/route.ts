import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Obtener todos los talleres
export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching talleres:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} talleres`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch talleres:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo taller
export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    
    // Validación básica de campos obligatorios
    if (!body.nombre || !body.ruc || !body.contacto || !body.telefono || !body.direccion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('talleres')
      .insert([{
        nombre: body.nombre,
        ruc: body.ruc,
        contacto: body.contacto,
        telefono: body.telefono,
        email: body.email || null,
        direccion: body.direccion,
        especialidad: body.especialidad || null,
        estado: body.estado || 'activo',
        updated_at: body.updated_at || new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    console.log('Successfully created taller:', data[0].nombre);
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create taller:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar un taller
export async function PATCH(req: Request) {
  const supabase = await createClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });

    const { data, error } = await supabase
      .from('talleres')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    console.log('Successfully updated taller:', id);
    return NextResponse.json(data[0]);

  } catch (error: any) {
    console.error('Failed to update taller:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un taller por ID
export async function DELETE(req: Request) {
  const supabase = await createClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await supabase
      .from('talleres')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('Successfully deleted taller:', id);
    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error: any) {
    console.error('Failed to delete taller:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Obtener todas las categorías
export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching categorias:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} categorias`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch categorias:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear una nueva categoría
export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    
    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // tipo_categoria es opcional, si no se envía usará el default 'producto'
    if (body.tipo_categoria) {
      const tiposValidos = ['producto', 'inventario'];
      if (!tiposValidos.includes(body.tipo_categoria.toLowerCase())) {
        return NextResponse.json({ 
          error: 'Tipo de categoría inválido. Debe ser "producto" o "inventario"' 
        }, { status: 400 });
      }
    }

    const insertData: any = {
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      estado: 'activo'  // Por defecto activo
    };

    // Solo agregar tipo_categoria si se proporciona
    if (body.tipo_categoria) {
      insertData.tipo_categoria = body.tipo_categoria.toLowerCase();
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([insertData])
      .select();

    if (error) throw error;

    console.log('Successfully created categoria:', data[0].nombre);
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create categoria:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar una categoría existente
export async function PUT(req: Request) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    const { id, nombre, descripcion, estado, tipo_categoria } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const updateData: any = {
      nombre,
      descripcion: descripcion || null
    };

    // Validar y actualizar estado si se proporciona
    if (estado) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(estado.toLowerCase())) {
        return NextResponse.json({ 
          error: 'Estado inválido. Debe ser "activo" o "inactivo"' 
        }, { status: 400 });
      }
      updateData.estado = estado.toLowerCase();
    }

    // Validar y actualizar tipo_categoria si se proporciona
    if (tipo_categoria) {
      const tiposValidos = ['producto', 'inventario'];
      if (!tiposValidos.includes(tipo_categoria.toLowerCase())) {
        return NextResponse.json({ 
          error: 'Tipo de categoría inválido. Debe ser "producto" o "inventario"' 
        }, { status: 400 });
      }
      updateData.tipo_categoria = tipo_categoria.toLowerCase();
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    console.log('Successfully updated categoria:', data[0].nombre);
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Failed to update categoria:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una categoría por ID
export async function DELETE(req: Request) {
  const supabase = await createClient();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar si la categoría existe antes de eliminar
    const { data: existing, error: fetchError } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Eliminar la categoría
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('Successfully deleted categoria:', existing.nombre);
    return NextResponse.json({ 
      message: 'Categoría eliminada correctamente',
      deleted: existing 
    });
  } catch (error: any) {
    console.error('Failed to delete categoria:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
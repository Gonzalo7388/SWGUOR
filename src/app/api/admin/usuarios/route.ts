import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Obtener todos los usuarios
export async function GET() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error en GET /api/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuarios' }, 
      { status: 500 }
    );
  }
}

// POST: Crear nuevo usuario
export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();

    // Validaciones
    if (!body.nombre_completo || !body.email) {
      return NextResponse.json(
        { error: 'nombre_completo y email son requeridos' }, 
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' }, 
        { status: 400 }
      );
    }

    // Normalizar estado a minúsculas
    const estadoNormalizado = body.estado 
      ? body.estado.toLowerCase().trim() 
      : 'activo';

    // Validar que el estado sea válido
    const estadosValidos = ['activo', 'inactivo', 'suspendido'];
    if (!estadosValidos.includes(estadoNormalizado)) {
      return NextResponse.json(
        { error: `Estado debe ser uno de: ${estadosValidos.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Normalizar rol a minúsculas
    const rolNormalizado = body.rol 
      ? body.rol.toLowerCase().trim() 
      : 'ayudante';

    // Validar que el rol sea válido
    const rolesValidos = [
      'administrador', 
      'cortador', 
      'diseñador', 
      'recepcionista', 
      'ayudante', 
      'representante_taller'
    ];
    if (!rolesValidos.includes(rolNormalizado)) {
      return NextResponse.json(
        { error: `Rol debe ser uno de: ${rolesValidos.join(', ')}` }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre_completo: body.nombre_completo.trim(),
        email: body.email.trim().toLowerCase(),
        telefono: body.telefono?.trim() || null,
        rol: rolNormalizado,
        estado: estadoNormalizado,
        auth_id: body.auth_id || null,
        created_by: body.created_by || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      
      // Manejar errores específicos
      if (error.code === '23505') { // Duplicate key
        if (error.message.includes('email')) {
          return NextResponse.json(
            { error: 'Este email ya está registrado' }, 
            { status: 409 }
          );
        }
        if (error.message.includes('auth_id')) {
          return NextResponse.json(
            { error: 'Este usuario ya está vinculado' }, 
            { status: 409 }
          );
        }
      }
      
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' }, 
      { status: 500 }
    );
  }
}

// PATCH: Editar información del usuario
export async function PATCH(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    // Validación de ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' }, 
        { status: 400 }
      );
    }

    // Normalizar estado si está presente
    if (updates.estado) {
      const estadoNormalizado = updates.estado.toLowerCase().trim();
      const estadosValidos = ['activo', 'inactivo', 'suspendido'];
      
      if (!estadosValidos.includes(estadoNormalizado)) {
        return NextResponse.json(
          { error: `Estado debe ser uno de: ${estadosValidos.join(', ')}` }, 
          { status: 400 }
        );
      }
      
      updates.estado = estadoNormalizado;
    }

    // Normalizar rol si está presente
    if (updates.rol) {
      const rolNormalizado = updates.rol.toLowerCase().trim();
      const rolesValidos = [
        'administrador', 
        'cortador', 
        'diseñador', 
        'recepcionista', 
        'ayudante', 
        'representante_taller'
      ];
      
      if (!rolesValidos.includes(rolNormalizado)) {
        return NextResponse.json(
          { error: `Rol debe ser uno de: ${rolesValidos.join(', ')}` }, 
          { status: 400 }
        );
      }
      
      updates.rol = rolNormalizado;
    }

    // Normalizar email si está presente
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json(
          { error: 'Formato de email inválido' }, 
          { status: 400 }
        );
      }
      updates.email = updates.email.trim().toLowerCase();
    }

    // Normalizar nombre si está presente
    if (updates.nombre_completo) {
      updates.nombre_completo = updates.nombre_completo.trim();
    }

    // Actualizar updated_at
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando usuario:', error);
      
      // Manejar error de usuario no encontrado
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Usuario no encontrado' }, 
          { status: 404 }
        );
      }
      
      // Manejar error de email duplicado
      if (error.code === '23505' && error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' }, 
          { status: 409 }
        );
      }
      
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en PATCH /api/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' }, 
      { status: 500 }
    );
  }
}

// DELETE — Soft delete (cambia estado a inactivo)
export async function DELETE(req: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get('id');

    if (!idRaw) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const id = Number(idRaw);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    // Verificar que existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, estado')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (existingUser.estado === 'inactivo') {
      return NextResponse.json({ error: 'El usuario ya está inactivo' }, { status: 400 });
    }

    // Soft delete: marcar como inactivo
    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado: 'inactivo', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Usuario desactivado correctamente', 
      deletedUser: data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar usuario' }, { status: 500 });
  }
}
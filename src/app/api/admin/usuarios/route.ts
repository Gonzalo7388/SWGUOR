import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type RolUsuario    = Database['public']['Enums']['rol'];
type EstadoUsuario = Database['public']['Enums']['EstadoUsuario'];

// Valores válidos extraídos del schema (enum de Supabase)
const ROLES_VALIDOS: RolUsuario[]    = ['administrador', 'cortador', 'disenador', 'recepcionista', 'ayudante', 'representante_taller', 'cliente'];
const ESTADOS_VALIDOS: EstadoUsuario[] = ['activo', 'inactivo', 'suspendido'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET: Obtener todos los usuarios
export async function GET() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/usuarios:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Crear nuevo usuario
export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();

    if (!body.nombre_completo || !body.email) {
      return NextResponse.json({ error: 'nombre_completo y email son requeridos' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    const rol: RolUsuario = body.rol?.toLowerCase().trim() ?? 'ayudante';
    if (!ROLES_VALIDOS.includes(rol)) {
      return NextResponse.json({ error: `Rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const estado: EstadoUsuario = body.estado?.toLowerCase().trim() ?? 'activo';
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: `Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre_completo: body.nombre_completo.trim(),
        email:           body.email.trim().toLowerCase(),
        telefono:        body.telefono ?? null,
        rol,
        estado,
        auth_id:         body.auth_id    ?? null,
        created_by:      body.created_by ?? null,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('email'))   return NextResponse.json({ error: 'Este email ya está registrado' },   { status: 409 });
        if (error.message.includes('auth_id')) return NextResponse.json({ error: 'Este usuario ya está vinculado' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('POST /api/usuarios:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Editar información del usuario
export async function PATCH(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    if (updates.estado !== undefined) {
      const v = updates.estado.toLowerCase().trim();
      if (!ESTADOS_VALIDOS.includes(v)) {
        return NextResponse.json({ error: `Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
      }
      updates.estado = v;
    }

    if (updates.rol !== undefined) {
      const v = updates.rol.toLowerCase().trim();
      if (!ROLES_VALIDOS.includes(v)) {
        return NextResponse.json({ error: `Rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}` }, { status: 400 });
      }
      updates.rol = v;
    }

    if (updates.email !== undefined) {
      if (!EMAIL_REGEX.test(updates.email)) {
        return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
      }
      updates.email = updates.email.trim().toLowerCase();
    }

    if (updates.nombre_completo !== undefined) {
      updates.nombre_completo = updates.nombre_completo.trim();
    }

    // updated_at lo maneja Supabase vía trigger; no hace falta enviarlo manualmente
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      if (error.code === '23505' && error.message.includes('email')) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('PATCH /api/usuarios:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Soft delete (cambia estado a inactivo)
export async function DELETE(req: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get('id');

    if (!idRaw) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const id = Number(idRaw);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

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

    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado: 'inactivo' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Usuario desactivado correctamente', deletedUser: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('DELETE /api/usuarios:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
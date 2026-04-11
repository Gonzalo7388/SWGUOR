export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type RolUsuario    = Database['public']['Enums']['RolPersonal'];
type EstadoUsuario = Database['public']['Enums']['EstadoUsuario'];

// Valores válidos extraídos del schema (enum de Supabase)
const ROLES_VALIDOS: RolUsuario[]    = ['administrador', 'cortador', 'disenador', 'recepcionista', 'ayudante', 'representante_taller', 'cliente', 'gerente'];
const ESTADOS_VALIDOS: EstadoUsuario[] = ['activo', 'inactivo', 'suspendido'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Roles válidos según el enum RolPersonal de Prisma
const ROLES_VALIDOS = [
  'administrador',
  'cortador',
  'disenador',
  'recepcionista',
  'ayudante',
  'representante_taller',
  'cliente',
  'gerente',
] as const;

const ESTADOS_VALIDOS = ['activo', 'inactivo', 'suspendido'] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET: Obtener todos los usuarios
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rol = searchParams.get('rol');
    const estado = searchParams.get('estado');

<<<<<<< HEAD
    const where: Record<string, unknown> = {};
    if (rol) where.rol = rol;
    if (estado) where.estado = estado;

    const usuarios = await prisma.usuarios.findMany({
      where,
      include: {
        clientes: { select: { id: true, razon_social: true } },
        _count: {
          select: {
            movimientos_inventario: true,
            pagos_orden: true,
            ventas: true,
          },
        },
      },
      orderBy: { nombre_completo: 'asc' },
    });

    return NextResponse.json(serializeBigInt(usuarios));
  } catch (error: any) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/usuarios:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> main
  }
}

// POST: Crear nuevo usuario
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre_completo || !body.email) {
<<<<<<< HEAD
      return NextResponse.json(
        { error: 'nombre_completo y email son requeridos' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    const estado = validarEstado(body.estado ?? 'activo');
    const rol = validarRol(body.rol ?? 'ayudante');

    const usuario = await prisma.usuarios.create({
      data: {
        nombre_completo: body.nombre_completo.trim(),
        email: body.email.trim().toLowerCase(),
        telefono: body.telefono ? BigInt(body.telefono) : null,
        rol,
        estado,
        auth_id: body.auth_id ?? null,
        created_by: body.created_by ?? null,
      },
    });

    return NextResponse.json(serializeBigInt(usuario), { status: 201 });
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
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
>>>>>>> main
  }
}

// PATCH: Editar información del usuario
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

<<<<<<< HEAD
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Validaciones de campos específicos
    if (updates.email) {
      if (!EMAIL_REGEX.test(updates.email)) {
        return NextResponse.json(
          { error: 'Formato de email inválido' },
          { status: 400 }
        );
=======
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
>>>>>>> main
      }
      updates.email = updates.email.trim().toLowerCase();
    }

<<<<<<< HEAD
    if (updates.rol) {
      updates.rol = validarRol(updates.rol);
    }

    if (updates.estado) {
      updates.estado = validarEstado(updates.estado);
    }

    if (updates.telefono !== undefined && updates.telefono !== null) {
      updates.telefono = BigInt(updates.telefono);
    }

    if (updates.nombre_completo) {
      updates.nombre_completo = updates.nombre_completo.trim();
    }

    const usuario = await prisma.usuarios.update({
      where: { id: BigInt(id) },
      data: updates,
    });

    return NextResponse.json(serializeBigInt(usuario));
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
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
>>>>>>> main
  }
}

// DELETE: Soft delete (cambia estado a inactivo)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get('id');

<<<<<<< HEAD
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const existing = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre_completo: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    await prisma.usuarios.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
      deletedUser: serializeBigInt(existing),
    });
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
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
>>>>>>> main
  }
}

// ─── Validadores ───────────────────────────────────────────────────────────

function validarRol(rol: string): (typeof ROLES_VALIDOS)[number] {
  const normalized = rol.toLowerCase().trim();
  if (!ROLES_VALIDOS.includes(normalized as any)) {
    throw new Error(`Rol inválido: "${rol}". Debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
  }
  return normalized as (typeof ROLES_VALIDOS)[number];
}

function validarEstado(estado: string): (typeof ESTADOS_VALIDOS)[number] {
  const normalized = estado.toLowerCase().trim();
  if (!ESTADOS_VALIDOS.includes(normalized as any)) {
    throw new Error(`Estado inválido: "${estado}". Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  return normalized as (typeof ESTADOS_VALIDOS)[number];
}

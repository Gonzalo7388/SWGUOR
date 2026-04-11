import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

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
  }
}

// POST: Crear nuevo usuario
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre_completo || !body.email) {
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
  }
}

// PATCH: Editar información del usuario
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

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
      }
      updates.email = updates.email.trim().toLowerCase();
    }

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
  }
}

// DELETE: Eliminar usuario
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

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

export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const CATEGORIAS_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador'];

// GET: Obtener todas las categorías
export async function GET() {
  const auth = await requireServerRole(CATEGORIAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const categorias = await prisma.categorias_productos.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(serializeBigInt(categorias));
  } catch (error: any) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear una nueva categoría
export async function POST(req: Request) {
  const auth = await requireServerRole(CATEGORIAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const categoria = await prisma.categorias_productos.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        activo: body.activo ?? true,
        orden: body.orden ?? null,
        imagen: body.imagen ?? null,
      },
    });

    return NextResponse.json(serializeBigInt(categoria), { status: 201 });
  } catch (error: any) {
    console.error('Error creating categoria:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar una categoría existente
export async function PUT(req: Request) {
  const auth = await requireServerRole(CATEGORIAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const existing = await prisma.categorias_productos.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    const categoria = await prisma.categorias_productos.update({
      where: { id: BigInt(id) },
      data: {
        ...(updates.nombre !== undefined && { nombre: updates.nombre }),
        ...(updates.descripcion !== undefined && { descripcion: updates.descripcion }),
        ...(updates.activo !== undefined && { activo: updates.activo }),
        ...(updates.orden !== undefined && { orden: updates.orden }),
        ...(updates.imagen !== undefined && { imagen: updates.imagen }),
      },
    });

    return NextResponse.json(serializeBigInt(categoria));
  } catch (error: any) {
    console.error('Error updating categoria:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una categoría por ID
export async function DELETE(req: Request) {
  const auth = await requireServerRole(CATEGORIAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const existing = await prisma.categorias_productos.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, nombre: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    await prisma.categorias_productos.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({
      message: 'Categoría eliminada correctamente',
      deleted: serializeBigInt(existing),
    });
  } catch (error: any) {
    console.error('Error deleting categoria:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

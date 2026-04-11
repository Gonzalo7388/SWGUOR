export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// GET: Obtener todos los clientes (Directorio)
export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { razon_social: 'asc' },
    });

    return NextResponse.json(serializeBigInt(clientes));
  } catch (error: any) {
    console.error('Error fetching clientes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear nuevo cliente desde el panel o al vender
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.ruc) {
      return NextResponse.json({ error: 'El RUC es obligatorio' }, { status: 400 });
    }

    const cliente = await prisma.clientes.create({
      data: {
        ruc: BigInt(body.ruc),
        razon_social: body.razon_social ?? null,
        email: body.email ?? null,
        telefono: body.telefono ? BigInt(body.telefono) : null,
        direccion: body.direccion ?? null,
        activo: body.activo ?? 'activo',
        TipoCliente: body.TipoCliente ?? null,
      },
    });

    return NextResponse.json(serializeBigInt(cliente), { status: 201 });
  } catch (error: any) {
    console.error('Error creating cliente:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese RUC' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Editar información del cliente
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Convertir campos BigInt si vienen en el body
    if (updates.ruc !== undefined) updates.ruc = BigInt(updates.ruc);
    if (updates.telefono !== undefined && updates.telefono !== null) {
      updates.telefono = BigInt(updates.telefono);
    }

    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data: updates,
    });

    return NextResponse.json(serializeBigInt(cliente));
  } catch (error: any) {
    console.error('Error updating cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese RUC' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un cliente por ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.clientes.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

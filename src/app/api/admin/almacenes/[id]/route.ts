import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { actualizarAlmacenSchema as almacenUpdateSchema } from '@/lib/schemas/almacenesSchema';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const almacen = await prisma.almacenes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!almacen) {
      return NextResponse.json({ error: 'Almacén no encontrado' }, { status: 404 });
    }

    return NextResponse.json(almacen);
  } catch (error) {
    console.error('Error fetching almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = almacenUpdateSchema.parse(body);

    const almacen = await prisma.almacenes.update({
      where: { id: parseInt(id) },
      data: validated,
    });

    return NextResponse.json(almacen);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error updating almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.almacenes.update({
      where: { id: parseInt(id) },
      data: { estado: 'inactivo' },
    });

    return NextResponse.json({ message: 'Almacén desactivado correctamente' });
  } catch (error) {
    console.error('Error deactivating almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { almacenUpdateSchema } from '@/lib/schemas/almacen';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const almacen = await prisma.almacenes.findUnique({
      where: { id: parseInt(params.id) },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = almacenUpdateSchema.parse(body);

    const almacen = await prisma.almacenes.update({
      where: { id: parseInt(params.id) },
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.almacenes.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Almacén eliminado' });
  } catch (error) {
    console.error('Error deleting almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
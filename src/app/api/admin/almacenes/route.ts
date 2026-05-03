import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { almacenSchema } from '@/lib/schemas/almacen';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const almacenes = await prisma.almacenes.findMany({
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(almacenes);
  } catch (error) {
    console.error('Error fetching almacenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = almacenSchema.parse(body);

    const almacen = await prisma.almacenes.create({
      data: validated,
    });

    return NextResponse.json(almacen, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error creating almacen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
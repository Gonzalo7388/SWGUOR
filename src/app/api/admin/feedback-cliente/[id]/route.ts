import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feedbackClienteUpdateSchema } from '@/lib/schemas/feedback-cliente';
import { ZodError } from 'zod';
import { serializeBigInt } from '@/lib/utils/serialize';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const feedback = await prisma.feedback_cliente.findUnique({
      where: { id: parseInt(id) },
      include: { clientes: true, pedidos: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback no encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(feedback));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = feedbackClienteUpdateSchema.parse(body);

    const feedback = await prisma.feedback_cliente.update({
      where: { id: parseInt(id) },
      data: validated,
      include: { clientes: true, pedidos: true },
    });

    return NextResponse.json(serializeBigInt(feedback));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.feedback_cliente.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Feedback eliminado' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
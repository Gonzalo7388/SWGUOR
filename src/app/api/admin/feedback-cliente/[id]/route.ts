import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feedbackClienteUpdateSchema } from '@/lib/schemas/feedback-cliente';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const feedback = await prisma.feedback_cliente.findUnique({
      where: { id: parseInt(params.id) },
      include: { clientes: true, pedidos: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback no encontrado' }, { status: 404 });
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = feedbackClienteUpdateSchema.parse(body);

    const feedback = await prisma.feedback_cliente.update({
      where: { id: parseInt(params.id) },
      data: validated,
      include: { clientes: true, pedidos: true },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.feedback_cliente.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Feedback eliminado' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feedbackClienteSchema } from '@/lib/schemas/feedback-cliente';
import { serializeBigInt } from '@/lib/utils/serialize';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get('cliente_id');
  const pedidoId = searchParams.get('pedido_id');

  const where: any = {};
  if (clienteId) where.cliente_id = parseInt(clienteId);
  if (pedidoId) where.pedido_id = parseInt(pedidoId);

  const feedbacks = await prisma.feedback_cliente.findMany({
    where,
    include: { clientes: true, pedidos: true },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(serializeBigInt(feedbacks));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = feedbackClienteSchema.parse(body);

  const feedback = await prisma.feedback_cliente.create({
    data: {
      cliente_id:  BigInt(validated.cliente_id),
      pedido_id:   BigInt(validated.pedido_id),
      puntuacion:  validated.puntuacion,
      comentarios: validated.comentarios ?? null,
    },
    include: { clientes: true, pedidos: true },
  });

  return NextResponse.json(serializeBigInt(feedback), { status: 201 });
}
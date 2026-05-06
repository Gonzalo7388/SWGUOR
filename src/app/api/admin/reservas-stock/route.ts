export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reservaStockBaseSchema as reservasStockSchema } from '@/lib/schemas/reservaStockSchema';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const reservas = await prisma.reservas_stock.findMany({
      orderBy: { id: 'desc' },
      include: { pedidos: true },
    });
    return NextResponse.json(serializeBigInt(reservas));
  } catch (error: any) {
    console.error('[GET /reservas-stock]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reservasStockSchema.parse(body);

    const reserva = await prisma.reservas_stock.create({
      data: {
        variante_id: BigInt(validated.variante_id),
        pedido_id: validated.pedido_id ? BigInt(validated.pedido_id) : undefined,
        cantidad: validated.cantidad,
        estado: validated.estado,
      },
      include: { pedidos: true },
    });

    return NextResponse.json(serializeBigInt(reserva), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[POST /reservas-stock]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
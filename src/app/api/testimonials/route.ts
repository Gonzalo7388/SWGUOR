import { NextResponse } from 'next/server';
import { prisma, prismaAvailable } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export async function GET() {
  try {
    if (!prismaAvailable) {
      return NextResponse.json([]);
    }
    const testimonials = await prisma.feedback_cliente.findMany({
      where: {
        puntuacion: 5
      },
      include: {
        clientes: {
          select: {
            nombre_comercial: true,
            ruc: true,
          }
        }
      },
      take: 10,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(serializeBigInt(testimonials));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

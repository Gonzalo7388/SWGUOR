import { NextResponse } from 'next/server';
import { prisma, prismaAvailable } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database client not initialized' },
      { status: 503 }
    );
  }

  try {
    if (!prismaAvailable) {
      return NextResponse.json([]);
    }
    const testimonials = await prisma.feedback_cliente.findMany({
      where: {
        estado: 'revisado',
        puntuacion: { gte: 4 },
        comentarios: { not: null },
      },
      include: {
        clientes: {
          select: {
            nombre_comercial: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(serializeBigInt(testimonials), {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

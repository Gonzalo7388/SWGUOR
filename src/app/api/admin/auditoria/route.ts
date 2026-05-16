export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { requireAdmin } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const table = searchParams.get('table');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (action) where.accion = action;
    if (table) where.tabla = table;
    if (userId) where.usuario_id = BigInt(userId);

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: {
          usuarios: {
            select: {
              email: true,
              personal_interno: {
                select: { nombre_completo: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditoria.count({ where }),
    ]);

    return NextResponse.json(serializeBigInt({
      data: registros,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }));

  } catch (error: any) {
    console.error('[API_AUDITORIA] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
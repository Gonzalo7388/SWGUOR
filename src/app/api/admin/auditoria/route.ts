export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditoriaQuerySchema } from '@/lib/schemas/auditoria';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = auditoriaQuerySchema.safeParse({
      usuario_id: searchParams.get('usuario_id') ?? undefined,
      tabla: searchParams.get('tabla') ?? undefined,
      accion: searchParams.get('accion') ?? undefined,
      desde: searchParams.get('desde') ?? undefined,
      hasta: searchParams.get('hasta') ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Filtros inválidos', details: result.error.issues }, { status: 400 });
    }

    const { usuario_id, tabla, accion, desde, hasta } = result.data;
    const where: any = {};

    if (usuario_id) where.usuario_id = BigInt(usuario_id);
    if (tabla) where.tabla = tabla;
    if (accion) where.accion = accion;
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = new Date(desde);
      if (hasta) where.created_at.lte = new Date(hasta);
    }

    const auditorias = await prisma.auditoria.findMany({
      where,
      include: { usuarios: { select: { id: true, email: true } } },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(serializeBigInt(auditorias));
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Filtros inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[GET /auditoria]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
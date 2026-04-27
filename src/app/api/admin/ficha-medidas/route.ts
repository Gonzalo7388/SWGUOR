export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const FICHA_MEDIDAS_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador', 'cortador'];

// ── GET: Medidas por ficha ────────────────────────────────────────────────
export async function GET(req: Request) {
  const auth = await requireServerRole(FICHA_MEDIDAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const ficha_id = searchParams.get('ficha_id');

    if (!ficha_id) {
      return NextResponse.json({ error: 'ficha_id requerido' }, { status: 400 });
    }

    const medidas = await prisma.ficha_medidas.findMany({
      where: { id_ficha: BigInt(ficha_id) },
      orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }],
    });

    return NextResponse.json({ success: true, data: serializeBigInt(medidas) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Guardar medidas en bloque (reemplaza todas) ─────────────────────
export async function POST(req: Request) {
  const auth = await requireServerRole(FICHA_MEDIDAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {  
    const body = await req.json();
    const { ficha_id, medidas } = body;

    if (!ficha_id || !Array.isArray(medidas)) {
      return NextResponse.json({ error: 'ficha_id y medidas[] requeridos' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Eliminar medidas anteriores
      await tx.ficha_medidas.deleteMany({
        where: { id_ficha: BigInt(ficha_id) },
      });

      // Insertar nuevas
      if (medidas.length > 0) {
        await tx.ficha_medidas.createMany({
          data: medidas.map((m: any) => ({
            id_ficha:     BigInt(ficha_id),
            punto_medida: m.punto_medida,
            talla:        m.talla,
            valor_cm:     m.valor_cm     ?? null,
            tolerancia:   m.tolerancia   ?? null,
          })),
        });
      }

      return tx.ficha_medidas.findMany({
        where: { id_ficha: BigInt(ficha_id) },
        orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }],
      });
    });

    return NextResponse.json({ success: true, data: serializeBigInt(result) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE: Eliminar una medida por id ────────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireServerRole(FICHA_MEDIDAS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    await prisma.ficha_medidas.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Medida no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
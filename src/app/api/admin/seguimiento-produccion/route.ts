export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const SEGUIMIENTO_PRODUCCION_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador', 'cortador', 'representante_taller', 'ayudante'];

// ── GET: Seguimientos por orden ───────────────────────────────────────────
export async function GET(req: Request) {
  const auth = await requireServerRole(SEGUIMIENTO_PRODUCCION_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orden_id = searchParams.get('orden_id');

    if (!orden_id) {
      return NextResponse.json({ error: 'orden_id requerido' }, { status: 400 });
    }

    const seguimientos = await prisma.seguimiento_produccion.findMany({
      where: { orden_id: BigInt(orden_id) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimientos) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Registrar nueva etapa ───────────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireServerRole(SEGUIMIENTO_PRODUCCION_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { orden_id, etapa, observaciones } = body;

    if (!orden_id || !etapa) {
      return NextResponse.json({ error: 'orden_id y etapa requeridos' }, { status: 400 });
    }

    await prisma.seguimiento_produccion.updateMany({
      where: { orden_id: BigInt(orden_id), activo: true },
      data:  { activo: false, completado_en: new Date() },
    });

    const seguimiento = await prisma.seguimiento_produccion.create({
      data: {
        orden_id:      BigInt(orden_id),
        etapa,
        observaciones: observaciones ?? null,
        usuario_id:    BigInt(auth.user.id),
        activo:        true,
      },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimiento) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
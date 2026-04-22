export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getUsuario() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('usuarios')
    .select('id, rol, auth_id')
    .eq('auth_id', user.id)
    .single();
  return data ? { ...data, auth_id: user.id } : null;
}

// ── GET: Seguimientos por confección ─────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const confeccion_id = searchParams.get('confeccion_id');

    if (!confeccion_id) {
      return NextResponse.json({ error: 'confeccion_id requerido' }, { status: 400 });
    }

    const seguimientos = await prisma.seguimiento_confeccion.findMany({
      where: { confeccion_id: BigInt(confeccion_id) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimientos) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Registrar cambio de estado ─────────────────────────────────────
export async function POST(req: Request) {
  try {
    const usuario = await getUsuario();
    if (!usuario) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { confeccion_id, estado_anterior, estado_nuevo, notas } = body;

    if (!confeccion_id || !estado_nuevo) {
      return NextResponse.json({ error: 'confeccion_id y estado_nuevo requeridos' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Registrar en seguimiento
      const seg = await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id:   BigInt(confeccion_id),
          estado_anterior: estado_anterior ?? null,
          estado_nuevo,
          notas:           notas ?? null,
          responsable_id: usuario.id ?? null
        },
      });

      // Actualizar estado en confecciones
      await tx.confecciones.update({
        where: { id: BigInt(confeccion_id) },
        data:  { estado: estado_nuevo, updated_at: new Date() },
      });

      return seg;
    });

    return NextResponse.json({ success: true, data: serializeBigInt(result) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
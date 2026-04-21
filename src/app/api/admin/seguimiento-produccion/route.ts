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

// ── GET: Seguimientos por orden ───────────────────────────────────────────
export async function GET(req: Request) {
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
  try {
    const usuario = await getUsuario();
    if (!usuario) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { orden_id, etapa, observaciones } = body;

    if (!orden_id || !etapa) {
      return NextResponse.json({ error: 'orden_id y etapa requeridos' }, { status: 400 });
    }

    // Cerrar etapa activa anterior
    await prisma.seguimiento_produccion.updateMany({
      where: { orden_id: BigInt(orden_id), activo: true },
      data:  { activo: false, completado_en: new Date() },
    });

    const seguimiento = await prisma.seguimiento_produccion.create({
      data: {
        orden_id:      BigInt(orden_id),
        etapa,
        observaciones: observaciones ?? null,
        usuario_id:    usuario.id ? String(usuario.id) : null,
        activo:        true,
      },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimiento) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
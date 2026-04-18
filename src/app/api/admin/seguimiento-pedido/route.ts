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
    .select('rol, auth_id')
    .eq('auth_id', user.id)
    .single();
  return data ? { ...data, auth_id: user.id } : null;
}

const ROLES_PERMITIDOS = ['administrador', 'gerente', 'recepcionista'];

// ── GET: Seguimientos por pedido ──────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pedido_id = searchParams.get('pedido_id');

    if (!pedido_id) {
      return NextResponse.json({ error: 'pedido_id requerido' }, { status: 400 });
    }

    const seguimientos = await prisma.seguimiento_pedido.findMany({
      where: { pedido_id: BigInt(pedido_id) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(seguimientos) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Cambiar estado de pedido ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const usuario = await getUsuario();
    if (!usuario || !ROLES_PERMITIDOS.includes(usuario.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { pedido_id, status, notas } = body;

    if (!pedido_id || !status) {
      return NextResponse.json({ error: 'pedido_id y status requeridos' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const seg = await tx.seguimiento_pedido.create({
        data: {
          pedido_id:  BigInt(pedido_id),
          status,
          notas:      notas ?? null,
          creado_por: usuario.auth_id,
        },
      });

      // Actualizar estado del pedido
      await tx.pedidos.update({
        where: { id: BigInt(pedido_id) },
        data:  { estado: status, updated_at: new Date() },
      });

      return seg;
    });

    return NextResponse.json({ success: true, data: serializeBigInt(result) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
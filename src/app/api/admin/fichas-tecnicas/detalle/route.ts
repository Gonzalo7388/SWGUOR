export const runtime = 'nodejs';

import { NextResponse }                    from 'next/server';
import { FichasTecnicasDetalleService }   from '@/lib/services/fichas-tecnicas-detalle-services';
import { createServerClient }             from '@supabase/ssr';
import { cookies }                        from 'next/headers';

async function getRol() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('usuarios').select('rol').eq('auth_id', user.id).single();
  return data?.rol ?? null;
}

const ROLES_PERMITIDOS = ['disenador', 'cortador', 'administrador', 'gerente'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ficha_id = searchParams.get('ficha_id');
    if (!ficha_id) {
      return NextResponse.json({ error: 'ficha_id requerido' }, { status: 400 });
    }

    const data = await FichasTecnicasDetalleService.obtenerPorFicha(ficha_id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { ficha_id, items } = body;

    if (!ficha_id || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'ficha_id y items[] requeridos' },
        { status: 400 }
      );
    }

    const data = await FichasTecnicasDetalleService.guardar(ficha_id, items);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    await FichasTecnicasDetalleService.eliminarItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
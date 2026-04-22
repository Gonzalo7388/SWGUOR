export const runtime = 'nodejs';

import { NextResponse }          from 'next/server';
import { CotizacionesService }   from '@/lib/services/cotizaciones-services';
import { createServerClient }    from '@supabase/ssr';
import { cookies }               from 'next/headers';

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

const ROLES_LECTURA   = ['administrador', 'gerente', 'recepcionista', 'disenador'];
const ROLES_ESCRITURA = ['administrador', 'gerente', 'recepcionista'];

export async function GET(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_LECTURA.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const data = await CotizacionesService.listar(
      searchParams.get('estado') ?? undefined
    );
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_ESCRITURA.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await req.json();
    if (!body.items?.length || !body.valida_hasta) {
      return NextResponse.json(
        { error: 'items y valida_hasta son requeridos' },
        { status: 400 }
      );
    }
    const data = await CotizacionesService.crear(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
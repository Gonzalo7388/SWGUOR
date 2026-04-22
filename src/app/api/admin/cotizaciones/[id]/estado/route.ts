export const runtime = 'nodejs';

import { NextResponse }        from 'next/server';
import { CotizacionesService } from '@/lib/services/cotizaciones-services';
import { createServerClient }  from '@supabase/ssr';
import { cookies }             from 'next/headers';

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

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const rol = await getRol();
    if (!rol || !['administrador', 'gerente', 'recepcionista'].includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id }           = await params;
    const { estado, motivo } = await req.json();

    if (!estado) {
      return NextResponse.json({ error: 'estado requerido' }, { status: 400 });
    }

    const result = await CotizacionesService.actualizarEstado(id, estado, motivo);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
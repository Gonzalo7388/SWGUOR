export const runtime = 'nodejs';

import { NextResponse }       from 'next/server';
import { MaterialesService }  from '@/lib/services/material-services';
import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';

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

const ROLES_LECTURA  = ['administrador', 'gerente', 'disenador', 'cortador', 'representante_taller'];
const ROLES_ESCRITURA = ['administrador', 'gerente', 'disenador', 'cortador'];

export async function GET(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_LECTURA.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const data = await MaterialesService.listar({
      tipo:      searchParams.get('tipo')      ?? undefined,
      busqueda:  searchParams.get('busqueda')  ?? undefined,
      bajo_stock: searchParams.get('stockBajo') === 'true',
    });

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
    if (!body.nombre) {
      return NextResponse.json({ error: 'nombre requerido' }, { status: 400 });
    }

    const data = await MaterialesService.crear(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_ESCRITURA.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const data = await MaterialesService.actualizar(id, updates);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const rol = await getRol();
    if (!rol || !ROLES_ESCRITURA.includes(rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    await MaterialesService.eliminar(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
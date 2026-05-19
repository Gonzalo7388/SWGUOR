export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { FichasTecnicasDetalleService } from '@/lib/services/fichas-tecnicas-detalle.service';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const FICHAS_TECNICAS_DETALLE_ROLES: RolUsuario[] = ['disenador', 'cortador', 'administrador', 'gerente'];

export async function GET(req: Request) {
  const auth = await requireServerRole(FICHAS_TECNICAS_DETALLE_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
  const auth = await requireServerRole(FICHAS_TECNICAS_DETALLE_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
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
  const auth = await requireServerRole(FICHAS_TECNICAS_DETALLE_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    await FichasTecnicasDetalleService.eliminarItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
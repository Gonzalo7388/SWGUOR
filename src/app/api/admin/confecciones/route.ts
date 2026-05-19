export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const CONFECCIONES_ROLES = ['administrador', 'gerente', 'representante_taller'] as RolUsuario[];

export async function GET(req: Request) {
  const auth = await requireServerRole(CONFECCIONES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);

    const data = await ConfeccionesService.listar({
      estado: searchParams.get('estado') ?? '',
      taller_id: searchParams.get('taller_id') ?? '',
      orden_produccion_id: searchParams.get('orden_produccion_id') ?? '',
      prioridad: searchParams.get('prioridad') ?? '',
      search: searchParams.get('search') ?? '',
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 10,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('[GET /api/admin/confecciones]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
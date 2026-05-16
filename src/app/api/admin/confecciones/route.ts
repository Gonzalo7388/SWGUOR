export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';

const CONFECCIONES_ROLES: any = ['administrador', 'gerente', 'disenador', 'almacenero'];

// GET /api/admin/confecciones
export async function GET(req: Request) {
  const auth = await requireServerRole(CONFECCIONES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const data = await ConfeccionesService.listar({
      estado: searchParams.get('estado') ?? undefined,
      taller_id: searchParams.get('taller_id') ?? undefined,
      pedido_id: searchParams.get('pedido_id') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 10,
      statusFilter: searchParams.get('statusFilter') ?? undefined,
    });
    // El servicio ahora retorna { data, meta }
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('[GET /confecciones]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
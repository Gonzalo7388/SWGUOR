export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/lib/services/cotizaciones-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const COTIZACIONES_APROBAR_ROLES: RolUsuario[] = ['administrador', 'gerente'];

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const auth = await requireServerRole(COTIZACIONES_APROBAR_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id }   = await params;
    const result   = await CotizacionesService.aprobar(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success:  true,
      pedidoId: result.pedidoId ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
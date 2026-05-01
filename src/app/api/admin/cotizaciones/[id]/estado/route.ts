export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/lib/services/cotizaciones-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const COTIZACIONES_ESTADO_ROLES: RolUsuario[] = ['administrador', 'gerente', 'recepcionista'];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireServerRole(COTIZACIONES_ESTADO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
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
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { asientosContablesSchema } from '@/lib/schemas/asientos-contables';
import { AsientosContablesService } from '@/lib/services/asientos-contables-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ZodError } from 'zod';

const ASIENTOS_CONTABLES_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(request: Request) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const url = new URL(request.url);
    const pedido_id = url.searchParams.get('pedido_id') ?? undefined;
    const pago_id = url.searchParams.get('pago_id') ?? undefined;
    const data = await AsientosContablesService.listar({ pedido_id, pago_id });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const validated = asientosContablesSchema.parse(body);
    const data = await AsientosContablesService.crear(validated);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

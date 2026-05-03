export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { precioHistoricoSchema } from '@/lib/schemas/precio-historico';
import { PrecioHistoricoService } from '@/lib/services/precio-historico-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ZodError } from 'zod';

const PRECIO_HISTORICO_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(request: Request) {
  const auth = await requireServerRole(PRECIO_HISTORICO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const url = new URL(request.url);
    const producto_id = url.searchParams.get('producto_id') ?? undefined;
    const data = await PrecioHistoricoService.listar(producto_id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireServerRole(PRECIO_HISTORICO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const validated = precioHistoricoSchema.parse(body);
    const data = await PrecioHistoricoService.crear(validated);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

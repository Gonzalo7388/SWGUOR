export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { precioHistoricoBaseSchema as precioHistoricoUpdateSchema } from '@/lib/schemas/precioHistoricoSchema';
import { PrecioHistoricoService } from '@/lib/services/precio-historico-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ZodError } from 'zod';

const PRECIO_HISTORICO_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(PRECIO_HISTORICO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const data = await PrecioHistoricoService.obtenerPorId(params.id);
    if (!data) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(PRECIO_HISTORICO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const validated = precioHistoricoUpdateSchema.parse(body);
    const data = await PrecioHistoricoService.actualizar(params.id, validated);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(PRECIO_HISTORICO_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await PrecioHistoricoService.eliminar(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

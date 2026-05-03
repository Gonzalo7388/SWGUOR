export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { asientosContablesUpdateSchema } from '@/lib/schemas/asientos-contables';
import { AsientosContablesService } from '@/lib/services/asientos-contables-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ZodError } from 'zod';

const ASIENTOS_CONTABLES_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const data = await AsientosContablesService.obtenerPorId(params.id);
    if (!data) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const validated = asientosContablesUpdateSchema.parse(body);
    const data = await AsientosContablesService.actualizar(params.id, validated);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await AsientosContablesService.eliminar(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

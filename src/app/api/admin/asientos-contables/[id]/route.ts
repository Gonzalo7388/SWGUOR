export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { asientoContableBaseSchema as asientosContablesUpdateSchema } from '@/lib/schemas/asientosContablesSchema';
import { asientosContablesService } from '@/lib/services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { ZodError } from 'zod';

const ASIENTOS_CONTABLES_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const data = await asientosContablesService.obtenerPorId(Number(id));
    if (!data) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = asientosContablesUpdateSchema.parse(body);
    const data = await asientosContablesService.actualizar(Number(id), validated);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireServerRole(ASIENTOS_CONTABLES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const result = await asientosContablesService.eliminar(Number(id));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

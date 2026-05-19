export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const ROLES = ['representante_taller'] as RolUsuario[];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.estado) {
      return NextResponse.json({ error: 'El campo estado es requerido' }, { status: 400 });
    }

    const seg = await ConfeccionesService.actualizarEstado(id, {
      estado: body.estado,
      notas: body.notas ?? null,
      responsable_id: auth.user.id?.toString(),
    });

    return NextResponse.json({ success: true, data: seg });
  } catch (error: any) {
    console.error('[POST /api/admin/confecciones/[id]/estado]', error);
    return NextResponse.json({ error: error.message ?? 'Error interno' }, { status: 500 });
  }
}
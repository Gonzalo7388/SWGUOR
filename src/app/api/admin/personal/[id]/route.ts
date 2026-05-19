import { UsuariosService } from '@/lib/services/usuarios.service';
import { PersonalInternoService } from '@/lib/services/personal-interno.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { EstadoUsuario } from '@prisma/client';

const ROLES = ['administrador', 'gerente'] as RolUsuario[];

// PATCH /api/admin/personal/[id]/estado
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const { estado } = await req.json();

    if (!estado) {
      return NextResponse.json({ error: 'estado es requerido' }, { status: 400 });
    }

    // 1. Obtener el usuario vinculado al personal
    const personal = await PersonalInternoService.obtenerPorId(id);
    if (!personal) {
      return NextResponse.json({ error: 'Personal no encontrado' }, { status: 404 });
    }

    // 2. Cambiar estado del usuario vinculado (controla el acceso)
    if (personal.usuarios?.id) {
      await UsuariosService.cambiarEstado(
        personal.usuarios.id.toString(),
        estado as EstadoUsuario,
      );
    }

    // 3. Actualizar estado del personal
    const resultado = await PersonalInternoService.actualizar(id, { estado });

    return NextResponse.json({ success: true, data: resultado });
  } catch (error: any) {
    console.error('[PATCH /api/admin/personal/[id]/estado]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}